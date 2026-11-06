import config from '@automattic/calypso-config';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useMcpTracksAudienceProps } from '../../../me/mcp/tracks';
import { useConsumeSearchParams } from '../../app/hooks/use-consume-search-params';
import ComponentViewTracker from '../../components/component-view-tracker';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import WordPressAgentEmail from '../mcp/wordpress-agent-email';
import WordPressAgentSlack from '../mcp/wordpress-agent-slack';
import WordPressAgentTelegram from '../mcp/wordpress-agent-telegram';

import './style.scss';

const CONNECTION_CALLBACK_PARAMS = [
	'pair_token',
	'slack',
	'telegram_id',
	'token',
	'ts',
	'bot',
] as const;

export default function WordPressAgent() {
	const tracksAudienceProps = useMcpTracksAudienceProps();
	const { pair_token, slack, telegram_id, token, ts, bot } = useConsumeSearchParams(
		CONNECTION_CALLBACK_PARAMS
	);

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'WordPress Agent' ) }
					description={ __(
						'WordPress Agent helps you manage your site, create content, and monitor performance. Choose how you want to reach your agents.'
					) }
				/>
			}
		>
			<ComponentViewTracker
				eventName="calypso_dashboard_wordpress_agent_connections_view"
				properties={ tracksAudienceProps }
			/>
			<VStack spacing={ 8 }>
				<WordPressAgentEmail />
				{ config.isEnabled( 'dolly/telegram' ) && (
					<WordPressAgentTelegram
						telegramId={ telegram_id }
						token={ token }
						timestamp={ ts }
						bot={ bot }
					/>
				) }
				{ config.isEnabled( 'wordpress-agent-slack' ) && (
					<WordPressAgentSlack pairToken={ pair_token } slackStatus={ slack } />
				) }
			</VStack>
		</PageLayout>
	);
}
