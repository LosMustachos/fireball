import { createContext, useContext, useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';

import { useMetamask } from 'use-metamask';

import autopetApi from 'api/autopet.api';
import ghstApi from 'api/ghst.api';
import mainApi from 'api/main.api';
import { SnackbarContext } from 'contexts/SnackbarContext';
import { LoginContext } from 'contexts/LoginContext';

import { tabStyles } from './styles';

export const AutopetContext = createContext({});

const AutopetContextProvider = (props) => {
    const [ghstState, setGhstState] = useState('approve');
    const [petState, setPetState] = useState('approve');
    const [stakeState, setStakeState] = useState('approve');
    const [connectState, setConnectState] = useState('approve');

    const [isPetApproved, setIsPetApproved] = useState(false);
    const [isStaked, setIsStaked] = useState(false);
    const [isGhstApproved, setIsGhstApproved] = useState(false);
    const [isUserConnected, setIsUserConnected] = useState(false);
    const [connectedWallet, setConnectedWallet] = useState('');

    const classes = tabStyles();

    const [tabs, setTabs] = useState({
        connect: {
            text: 'Connect wallet',
            done: false,
            disabled: true
        },
        pet: {
            text: 'Approve Petting',
            done: false,
            disabled: true
        },
        ghst: {
            text: 'Approve GHST',
            done: false
        },
        stake: {
            text: 'Stake & Start!',
            done: false
        }
    });

    const { showSnackbar } = useContext(SnackbarContext);
    const { connectMetamask } = useContext(LoginContext);

    const { metaState } = useMetamask();

    const approveConnect = async () => {
        setConnectState('approving');

        const isConnected = await connectMetamask();

        setConnectState('approve');

        if (!isConnected) {
            return;
        }

        updateProgress('connect', isConnected);
        setIsUserConnected(isConnected);
    }

    const approvePet = async (approval) => {
        const succesMessage = approval ? 'Petting approved!' : 'Petting approval revoked!';
        const errorMessage = approval ? 'Petting approval failed!' : 'Revoking petting approval failed!';

        setPetState('approving');

        try {
            const isApproved = await mainApi.oldApprovePet(approval);

            if (isApproved) {
                setIsPetApproved(approval);
                updateProgress('pet', approval);
                showSnackbar('success', succesMessage);
            } else {
                showSnackbar('error', errorMessage);
            }

            setPetState('approve');
        } catch {
            setPetState('approve');
        }
    };

    const approveGhst = async (approval) => {
        const succesMessage = approval ? 'GHST approved!' : 'GHST approval revoked!';
        const errorMessage = approval ? 'GHST approval failed!' : 'Revoking GHST approval failed!';

        setGhstState('approving');

        try {
            const isApproved = await ghstApi.oldApproveGhst(approval);

            if (isApproved) {
                setIsGhstApproved(approval);
                updateProgress('ghst', approval);
                showSnackbar('success', succesMessage);
            } else {
                showSnackbar('error', errorMessage);
            }

            setGhstState('approve');
        } catch {
            setGhstState('approve');
        }
    };

    const approveStake = async (approval) => {
        const succesMessage = approval ? 'Staking approved!' : 'Unstaking approved!';
        const errorMessage = approval ? 'Staking failed!' : 'Unstaking failed!';

        setStakeState('approving');

        try {
            const isApproved = Boolean(await autopetApi.oldSubscribe(approval));

            if (isApproved) {
                setIsStaked(approval);
                updateProgress('stake', approval);
                showSnackbar('success', succesMessage);
            } else {
                showSnackbar('error', errorMessage);
            }

            setStakeState('approve');
        } catch {
            setStakeState('approve');
        }
    };

    const updateProgress = (name, isApproved) => {
        setTabs(data => {
            const duplicated = {...data};
            duplicated[name].done = isApproved;

            return duplicated;
        });
    };

    const renderButtonNode = (state, defaultNode, approvedNode) => {
        switch (state) {
            case 'approved' :
                return approvedNode
            case 'approving':
                return (
                    <>
                        Approving <CircularProgress size={20} className={classes.panelButtonCitcular} />
                    </>
                )
            default:
                return defaultNode
        }
    }

    useEffect(() => {
        const accounts = metaState.account;
        const walletConnected  = accounts.length > 0;

        setIsUserConnected(walletConnected);

        if (accounts[0] === connectedWallet || !walletConnected) {
            return;
        }

        const tabsDuplicated = { ...tabs };
        let ready = 0;

        const updateTabs = () => {
            if (ready === Object.keys(tabs).length) {
                setTabs(tabsDuplicated);
            }
        }

        setConnectedWallet(accounts[0]);

        tabsDuplicated.connect.done = walletConnected;
        ++ready;
        updateTabs();

        mainApi.isOldPetApproved(accounts[0]).then(isApproved => {
            setIsPetApproved(isApproved);
            tabsDuplicated.pet.done = isApproved;
            ++ready;
            updateTabs();
        });

        ghstApi.isOldGhstApproved(accounts[0]).then(isApproved => {
            setIsGhstApproved(isApproved);
            tabsDuplicated.ghst.done = isApproved;
            ++ready;
            updateTabs();
        });

        autopetApi.oldGetUsers().then(users => {
            const isStaked = users.some(address => (
                accounts[0].toLowerCase() === address.toLowerCase()
            ));

            setIsStaked(isStaked);
            tabsDuplicated.stake.done = isStaked;
            ++ready;
            updateTabs();
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [metaState]);

    return (
        <AutopetContext.Provider value={{
            // states
            ghstState,
            petState,
            stakeState,
            connectState,

            isPetApproved,
            isGhstApproved,
            isUserConnected,
            isStaked,

            tabs,

            // functions
            approveGhst,
            approvePet,
            approveStake,
            approveConnect,
            renderButtonNode
        }}>
            { props.children }
        </AutopetContext.Provider>
    )
}

export default AutopetContextProvider;
