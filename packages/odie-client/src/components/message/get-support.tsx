import { localizeUrl } from '@automattic/i18n-utils';
import { __ } from '@wordpress/i18n';
import { useNavigate } from 'react-router-dom';
import { useOdieAssistantContext } from '../../context';
import { useCreateZendeskConversation } from '../../hooks';

import './get-support.scss';

interface GetSupportProps {
	onClickAdditionalEvent?: () => void;
	isUserEligibleForPaidSupport?: boolean;
}

interface ButtonConfig {
	text: string;
	action: () => Promise< void >;
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
} ) => {
	const navigate = useNavigate();
	const newConversation = useCreateZendeskConversation();
	const {
		chat,
		isUserEligibleForPaidSupport: contextIsUserEligibleForPaidSupport,
		canConnectToZendesk,
	} = useOdieAssistantContext();

	// Early return if user is already talking to a human
	if ( chat.provider !== 'odie' ) {
		return null;
	}

	if (
		! canConnectToZendesk &&
		( isUserEligibleForPaidSupport || contextIsUserEligibleForPaidSupport )
	) {
		return <NewThirdPartyCookiesNotice />;
	}

	const getButtonConfig = (): ButtonConfig => {
		if ( isUserEligibleForPaidSupport || contextIsUserEligibleForPaidSupport ) {
			return {
				text: __( 'Get instant support', __i18n_text_domain__ ),
				action: async () => {
					onClickAdditionalEvent?.();
					await newConversation();
				},
			};
		}

		return {
			text: __( 'Ask in our forums', __i18n_text_domain__ ),
			action: async () => {
				onClickAdditionalEvent?.();
				navigate( '/contact-form?mode=FORUM' );
			},
		};
	};

	const buttonConfig = getButtonConfig();

	const handleClick = async ( event: React.MouseEvent< HTMLButtonElement > ) => {
		event.preventDefault();
		await buttonConfig.action();
	};

	return (
		<div className="odie__transfer-chat">
			<button onClick={ handleClick }>{ buttonConfig.text }</button>
		</div>
	);
};
