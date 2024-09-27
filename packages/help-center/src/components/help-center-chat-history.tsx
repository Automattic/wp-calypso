import { TabPanel, Card } from '@wordpress/components';
import { chevronRight, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';

import './help-center-chat-history.scss';

export const HelpCenterChatHistory = () => {
	const { __ } = useI18n();

	// Random test data
	const recentTestData = [
		{
			id: 1,
			avatar: 'https://via.placeholder.com/150',
			lastMessage: {
				name: 'John Doe',
				message: 'Hello, how can I help you today?',
				date: '2023-12-26 00:00Z',
			},
		},
		{
			id: 2,
			avatar: 'https://via.placeholder.com/150',
			lastMessage: {
				name: 'Jane Doe',
				message: 'Hello, how can I help you today?',
				date: '2023-12-27 00:00Z',
			},
		},
	];

	return (
		<div className="help-center-chat-history">
			<TabPanel
				tabs={ [
					{
						name: 'recent',
						title: __( 'Recent' ),
						className: 'help-center-chat-history__recent',
					},
					{
						name: 'archived',
						title: __( 'Archived' ),
						className: 'help-center-chat-history__archived',
					},
				] }
			>
				{ () =>
					recentTestData.map( ( conversation ) => (
						<Card key={ conversation.id } className="help-center-chat-history__conversation-card">
							<div className="help-center-chat-history__conversation-avatar">
								<img src={ conversation.avatar } alt={ __( 'User Avatar' ) } />
							</div>
							<div className="help-center-chat-history__conversation-information">
								<div>{ conversation?.lastMessage?.message }</div>
								<div className="help-center-chat-history__conversation-sub-information">
									<span className="help-center-chat-history__conversation-information-name">
										{ conversation?.lastMessage?.name }
									</span>

									<span>{ conversation?.lastMessage?.date }</span>
								</div>
							</div>
							<div className="help-center-chat-history__open-conversation">
								<Icon icon={ chevronRight } size={ 24 } />
							</div>
						</Card>
					) )
				}
			</TabPanel>
		</div>
	);
};
