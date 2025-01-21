import { localizeUrl } from '@automattic/i18n-utils';
import { __ } from '@wordpress/i18n';
import { useNavigate } from 'react-router-dom';
import { useOdieAssistantContext } from '../../context';
import { useCreateZendeskConversation } from '../../hooks';

import './get-support.scss';

interface GetSupportProps {
	onClickAdditionalEvent?: ( destination: string ) => void;
	isUserEligibleForPaidSupport?: boolean;
	canConnectToZendesk?: boolean;
}

interface ButtonConfig {
	text: string;
	action: () => Promise< void >;
	waitTimeText?: string;
}

export const NewThirdPartyCookiesNotice: React.FC = () => {
	return (
		<div className="help-center__cookie-warning">
			<p>
				<strong>{ __( 'Enable cookies to get support.', __i18n_text_domain__ ) }</strong>
				&nbsp;
				{ __(
					'To access support, please turn on third-party cookies for WordPress.com.',
					__i18n_text_domain__
				) }
				&nbsp;
				<a
					target="_blank"
					rel="noopener noreferrer"
					href={ localizeUrl( 'https://wordpress.com/support/third-party-cookies/' ) }
				>
					{ __( 'Learn more.', __i18n_text_domain__ ) }
				</a>
			</p>
		</div>
	);
};

export const GetSupport: React.FC< GetSupportProps > = ( {
	onClickAdditionalEvent,
	isUserEligibleForPaidSupport,
	canConnectToZendesk = false,
} ) => {
	const navigate = useNavigate();
	const newConversation = useCreateZendeskConversation();
	const {
		chat,
		isUserEligibleForPaidSupport: contextIsUserEligibleForPaidSupport,
		canConnectToZendesk: contextCanConnectToZendesk,
	} = useOdieAssistantContext();

	// Early return if user is already talking to a human
	if ( chat.provider !== 'odie' ) {
		return null;
	}

	if (
		! ( canConnectToZendesk || contextCanConnectToZendesk ) &&
		( isUserEligibleForPaidSupport || contextIsUserEligibleForPaidSupport )
	) {
		return <NewThirdPartyCookiesNotice />;
	}

	const getButtonConfig = (): ButtonConfig[] => {
		if ( isUserEligibleForPaidSupport || contextIsUserEligibleForPaidSupport ) {
			return [
				{
					text: __( 'Chat with support', __i18n_text_domain__ ),
					waitTimeText: __( 'Average wait time < 5 minutes', __i18n_text_domain__ ),
					action: async () => {
						onClickAdditionalEvent?.( 'chat' );
						await newConversation();
					},
				},
				{
					text: __( 'Email support', __i18n_text_domain__ ),
					waitTimeText: __( 'Average wait time < 8 hours', __i18n_text_domain__ ),
					action: async () => {
						onClickAdditionalEvent?.( 'email' );
						await newConversation();
					},
				},
			];
		}

		return [
			{
				text: __( 'Ask in our forums', __i18n_text_domain__ ),
				action: async () => {
					onClickAdditionalEvent?.( 'forum' );
					navigate( '/contact-form?mode=FORUM' );
				},
			},
		];
	};

	const buttonConfig = getButtonConfig();

	const handleClick = async (
		event: React.MouseEvent< HTMLButtonElement >,
		button: ButtonConfig
	) => {
		event.preventDefault();
		await button.action();
	};

	return (
		<div className="odie__transfer-chat">
			{ buttonConfig.map( ( button, index ) => (
				<div className="odie__transfer-chat--button-container" key={ index }>
					<button onClick={ ( e ) => handleClick( e, button ) }>{ button.text }</button>
					<span className="odie__transfer-chat--wait-time">{ button.waitTimeText }</span>
				</div>
			) ) }
		</div>
	);
};
