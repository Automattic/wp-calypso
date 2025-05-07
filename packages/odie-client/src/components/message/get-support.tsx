import { useResetSupportInteraction } from '@automattic/help-center/src/hooks/use-reset-support-interaction';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { useLocation, useNavigate } from 'react-router-dom';
import { useOdieAssistantContext } from '../../context';
import { useGetSupportInteractionById } from '../../data';
import { useCreateZendeskConversation } from '../../hooks';
import { useGetMostRecentOpenConversation } from '../../hooks/use-get-most-recent-open-conversation';

import './get-support.scss';

interface GetSupportProps {
	onClickAdditionalEvent?: ( destination: string ) => void;
	isUserEligibleForPaidSupport?: boolean;
	canConnectToZendesk?: boolean;
}

interface ButtonConfig {
	className?: string;
	disabled?: boolean;
	text: string;
	action: () => Promise< void >;
	waitTimeText?: string;
	hideButton?: boolean;
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
	const resetSupportInteraction = useResetSupportInteraction();
	const location = useLocation();
	const {
		chat,
		isUserEligibleForPaidSupport: contextIsUserEligibleForPaidSupport,
		canConnectToZendesk: contextCanConnectToZendesk,
		trackEvent,
		isChatLoaded,
	} = useOdieAssistantContext();

	const { mostRecentSupportInteractionId } = useGetMostRecentOpenConversation();

	const { data: supportInteraction } = useGetSupportInteractionById(
		mostRecentSupportInteractionId?.toString() ?? null
	);

	const { setCurrentSupportInteraction } = useDataStoreDispatch( HELP_CENTER_STORE );

	// Early return if user is already talking to a human
	if ( chat.provider !== 'odie' ) {
		return null;
	}

	const disabledButton =
		! ( canConnectToZendesk || contextCanConnectToZendesk ) &&
		( isUserEligibleForPaidSupport || contextIsUserEligibleForPaidSupport );

	const getButtonConfig = (): ButtonConfig[] => {
		if ( isUserEligibleForPaidSupport || contextIsUserEligibleForPaidSupport ) {
			return [
				{
					text: __( 'Continue your open conversation', __i18n_text_domain__ ),
					action: async () => {
						if ( supportInteraction ) {
							trackEvent( 'chat_open_previous_conversation' );
							setCurrentSupportInteraction( supportInteraction );
							if ( ! location?.pathname?.includes( '/odie' ) ) {
								navigate( '/odie' );
							}
						}
					},
					hideButton: !! supportInteraction,
				},
				{
					disabled: disabledButton,
					className: clsx( 'odie__transfer-chat--button', {
						'odie__transfer-chat--button--disabled': disabledButton,
					} ),
					text: __( 'Chat with support', __i18n_text_domain__ ),
					waitTimeText: __( 'Average wait time < 5 minutes', __i18n_text_domain__ ),
					action: async () => {
						onClickAdditionalEvent?.( 'chat' );
						resetSupportInteraction().then( ( interaction ) => {
							if ( isChatLoaded ) {
								newConversation( {
									avoidTransfer: true,
									interactionId: interaction?.uuid,
									createdFrom: 'chat_support_button',
								} );
							}
						} );
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
			{ buttonConfig.map(
				( button, index ) =>
					button.hideButton !== false && (
						<div className="odie__transfer-chat--button-container" key={ index }>
							<button onClick={ ( e ) => handleClick( e, button ) } disabled={ button.disabled }>
								{ button.text }
							</button>
							{ button.waitTimeText && (
								<span className="odie__transfer-chat--wait-time">{ button.waitTimeText }</span>
							) }
						</div>
					)
			) }
		</div>
	);
};
