import React, { useContext, useEffect } from 'react';
import { Redirect, Route, Switch, useHistory, useParams, useRouteMatch } from 'react-router';
import { IconButton, Tooltip } from '@mui/material';
import { Box } from '@mui/system';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import GuildGotchis from '../components/GuildGotchis';
import GuildBanner from '../components/GuildInfo/GuildBanner';
import GuildsDetails from '../components/GuildInfo/GuildDetails';
import GuildNav from '../components/GuildNav';
import GuildsRealm from '../components/GuildsRealm';
import { GuildsContext } from '../GuildsContext';
import commonUtils from 'utils/commonUtils';
import { guildStyles } from '../styles';

export default function Guild() {
    const params = useParams();
    const classes = guildStyles();
    const history = useHistory();
    const match = useRouteMatch();
    const {
        guildsData,
        currentGuild,
        setCurrentGuild,
        loadGuildRealm
    } = useContext(GuildsContext);

    useEffect(() => {
        let guild = guildsData.find( guild => (
            commonUtils.stringToKey(guild.name) === params.name
        ));

        if (guild === undefined || guild.members?.length === 0) {
            return history.push('/guilds');
        };

        setCurrentGuild(guild);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (Object.keys(currentGuild).length === 0) {
            return;
        };

        loadGuildRealm(currentGuild);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentGuild]);

    return (
        <>
            <Box className={classes.guildWrapper}>

                <div className={classes.guildSidebar}>
                    <GuildBanner />
                    {Boolean(currentGuild.description?.length) &&  <GuildsDetails />}

                    <Tooltip
                        title='Back to guilds'
                    >
                        <IconButton className={classes.backButton} onClick={ () => {history.push('/guilds')}} >
                            <ArrowBackIcon />
                        </IconButton>
                    </Tooltip>
                </div>

                <Box className={classes.guildContent}>
                    <GuildNav />
                    <Switch>
                        <Route path={`${match.path}/gotchis`} component={ GuildGotchis } />
                        <Route path={`${match.path}/realm`} component={ GuildsRealm } />
                        <Redirect from={match.path} to={`${match.path}/gotchis`} />
                    </Switch>
                </Box>
            </Box>
        </>
    )
}
