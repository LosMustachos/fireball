import React, { useContext } from 'react';
import { IconButton, Link, Tooltip, Typography } from '@mui/material';
import { Box } from '@mui/system';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import TelegramIcon from '@mui/icons-material/Telegram';
import WebIcon from '@mui/icons-material/Web';

import classNames from 'classnames';

import { DiscordIcon, TwitchIcon } from 'components/Icons/Icons';
import { GuildsContext } from 'contexts/GuildsContext';

import GuildLogo from '../GuildLogo';
import { guildBanner } from '../../styles';

export default function GuildBanner() {
    const classes = guildBanner();
    const {
        currentGuild,
        guildGotchis,
    } = useContext(GuildsContext);

    const addSocial = (name) => {
        switch (name) {
            case 'facebook':
                return <FacebookIcon className={classes.guildSocialIcon} />
            case 'twitter':
                return <TwitterIcon className={classes.guildSocialIcon} />
            case 'discord':
                return <DiscordIcon className={classes.guildSocialIcon} />
            case 'telegram':
                return <TelegramIcon className={classes.guildSocialIcon} />
            case 'twitch':
                return <TwitchIcon className={classes.guildSocialIcon} />
            default:
                return <WebIcon className={classes.guildSocialIcon} />
        }
    }

    const renderSocials = () => {
        return (
            Object.keys(currentGuild.socials).map((key) => (
                <Tooltip
                    title={key}
                    key={key}
                    placement='top'
                    followCursor
                >
                    <IconButton
                        component={Link}
                        href={currentGuild.socials[key]}
                        target='_blank'
                        className={classes.guildSocialButton}
                    >
                        {addSocial(key)}
                    </IconButton>
                </Tooltip>
            ))
        )
    }

    return (
        <Box className={classNames(classes.guildBanner, currentGuild.banner.length && classes.guildBannerIs ) } style={{ backgroundImage: `url(${currentGuild.banner})` }}>
            <div className={classes.guildBannerInner}>
                <div className={classes.guildBannerTop}>
                    <Typography className={classNames(classes.guildMembers, classes.guildBannerText)}>
                        Members
                        <span>
                            {currentGuild.members?.length ? `(${currentGuild.members.length})` : '...'}
                        </span>
                    </Typography>

                    <div className={classes.guildLogo}>
                        <GuildLogo logo={currentGuild.logo} className={classes.guildLogoImage} />
                    </div>

                    <Typography className={classNames(classes.guildGotchis, classes.guildBannerText)}>
                        <span>
                            {guildGotchis?.length ? `(${guildGotchis.length})` : '...'}
                        </span>
                        Gotchis
                    </Typography>
                </div>
                <Typography component='h1' className={classes.guildName}>{currentGuild?.name}</Typography>

                <div className={classes.guildSocials}>
                    {renderSocials()}
                </div>
            </div>
        </Box>
    );
}
