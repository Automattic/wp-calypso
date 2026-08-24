import config from '@automattic/calypso-config';
import { BigSkyLogo } from '@automattic/components/src/logos/big-sky-logo';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import { useMcpTracksAudienceProps } from '../../../../me/mcp/tracks';
import Breadcrumbs from '../../../app/breadcrumbs';
import { agentRoute } from '../../../app/router/me';
import ComponentViewTracker from '../../../components/component-view-tracker';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { SectionHeader } from '../../../components/section-header';
import WordPressAgentEmail from '../../mcp/wordpress-agent-email';
import WordPressAgentSlack from '../../mcp/wordpress-agent-slack';
import WordPressAgentTelegram from '../../mcp/wordpress-agent-telegram';

import './style.scss';

export default function WordPressAgent() {
	const tracksAudienceProps = useMcpTracksAudienceProps();
	const {
		pair_token: pairTokenParam,
		slack: slackStatusParam,
		telegram_id: telegramIdParam,
		token: telegramTokenParam,
		ts: telegramTimestampParam,
		bot: telegramBotParam,
	} = agentRoute.useSearch();
	const [ connectionCallbacks ] = useState( () => ( {
		pairToken: pairTokenParam,
		slackStatus: slackStatusParam,
		telegramId: telegramIdParam,
		telegramToken: telegramTokenParam,
		telegramTimestamp: telegramTimestampParam,
		telegramBot: telegramBotParam,
	} ) );

	useEffect( () => {
		if ( ! Object.values( connectionCallbacks ).some( Boolean ) ) {
			return;
		}

		const url = new URL( window.location.href );
		[ 'pair_token', 'slack', 'telegram_id', 'token', 'ts', 'bot' ].forEach( ( parameter ) =>
			url.searchParams.delete( parameter )
		);
		window.history.replaceState( window.history.state, '', url.toString() );
	}, [ connectionCallbacks ] );

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'WordPress Agent' ) }
					description={ __(
						'Your AI assistant for building, managing, and growing your WordPress.com sites.'
					) }
					prefix={ <Breadcrumbs length={ 2 } /> }
				/>
			}
		>
			<ComponentViewTracker
				eventName="calypso_dashboard_wordpress_agent_connections_view"
				properties={ tracksAudienceProps }
			/>
			<VStack spacing={ 4 }>
				<SectionHeader
					level={ 2 }
					title={ __( 'Connections' ) }
					description={ __( 'Talk to WordPress Agent where you already are.' ) }
					decoration={ <BigSkyLogo.CentralLogo heartless size={ 32 } /> }
				/>
				<WordPressAgentEmail />
				{ config.isEnabled( 'dolly/telegram' ) && (
					<WordPressAgentTelegram
						telegramId={ connectionCallbacks.telegramId }
						token={ connectionCallbacks.telegramToken }
						timestamp={ connectionCallbacks.telegramTimestamp }
						bot={ connectionCallbacks.telegramBot }
					/>
				) }
				{ config.isEnabled( 'wordpress-agent-slack' ) && (
					<WordPressAgentSlack
						pairToken={ connectionCallbacks.pairToken }
						slackStatus={ connectionCallbacks.slackStatus }
					/>
				) }
			</VStack>
		</PageLayout>
	);
}
