import { recordTracksEvent } from '@automattic/calypso-analytics';
import { FormInputValidation } from '@automattic/components';
import { HelpCenterSelect, HelpCenterSite } from '@automattic/data-stores';
import { useIsEnglishLocale } from '@automattic/i18n-utils';
import {
	useCanConnectToZendeskMessaging,
	useOpenZendeskMessaging,
} from '@automattic/zendesk-client';
import { useDispatch, useSelect } from '@wordpress/data';
import { hasTranslation } from '@wordpress/i18n';
import { Icon, comment } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo, useState } from 'react';
import useChatStatus from '../hooks/use-chat-status';
import { HELP_CENTER_STORE } from '../stores';
import ThirdPartyCookiesNotice from './help-center-third-party-cookies-notice';
import { generateContactOnClickEvent } from './utils';

import './help-center-contact-support-option.scss';

interface HelpCenterContactSupportOptionProps {
	productId: number | undefined;
	sectionName: string;
	site: HelpCenterSite;
	triggerSource?: string;
	articleUrl?: string | null | undefined;
	trackEventName?: string;
}

const HelpCenterContactSupportOption = ( {
	productId,
	sectionName,
	site,
	triggerSource,
	articleUrl,
	trackEventName,
}: HelpCenterContactSupportOptionProps ) => {
	const { __ } = useI18n();
	const isEnglishLocale = useIsEnglishLocale();
	const { hasActiveChats, isEligibleForChat } = useChatStatus();
	const { resetStore, setShowHelpCenter } = useDispatch( HELP_CENTER_STORE );
	const currentSupportInteraction = useSelect(
		( select ) =>
			( select( HELP_CENTER_STORE ) as HelpCenterSelect ).getCurrentSupportInteraction(),
		[]
	);
	const odieId =
		currentSupportInteraction?.events.find( ( event ) => event.event_source === 'odie' )
			?.event_external_id ?? null;

	const { data: canConnectToZendesk } = useCanConnectToZendeskMessaging();

	const { isOpeningZendeskWidget, openZendeskWidget } = useOpenZendeskMessaging(
		sectionName,
		'zendesk_support_chat_key',
		isEligibleForChat || hasActiveChats
	);

	const [ hasSubmittingError, setHasSubmittingError ] = useState< boolean >( false );

	const supportHeaderText = useMemo( () => {
		if ( isEnglishLocale || ! hasTranslation( 'Contact WordPress.com Support (English)' ) ) {
			return __( 'Contact WordPress.com Support', __i18n_text_domain__ );
		}

		return __( 'Contact WordPress.com Support (English)', __i18n_text_domain__ );
	}, [ __, isEnglishLocale ] );

	const handleOnClick = () => {
		generateContactOnClickEvent( 'chat', trackEventName );

		recordTracksEvent( 'calypso_inlinehelp_contact_submit', {
			support_variation: 'messaging',
			force_site_id: true,
			location: 'help-center',
			section: sectionName,
		} );

		recordTracksEvent( 'calypso_help_live_chat_begin', {
			site_plan_product_id: productId,
			is_automated_transfer: site?.is_wpcom_atomic,
			force_site_id: true,
			location: 'help-center',
			section: sectionName,
		} );

		const escapedWapuuChatId = encodeURIComponent( odieId || '' );

		const zendeskWidgetProps = {
			aiChatId: escapedWapuuChatId,
			siteUrl: site?.URL,
			siteId: site?.ID,
			onError: () => setHasSubmittingError( true ),
			onSuccess: () => {
				resetStore();
				setShowHelpCenter( false );
			},
			message: '',
		};

		if ( triggerSource === 'article-feedback-form' ) {
			let zendeskWidgetMessage = 'The user is contacting support from the article feedback form';
			if ( articleUrl ) {
				zendeskWidgetMessage += '<br/><br/>';
				zendeskWidgetMessage += 'They were viewing the article at: ' + articleUrl;
			}
			zendeskWidgetProps.message = zendeskWidgetMessage;
		}

		openZendeskWidget( zendeskWidgetProps );
	};

	return (
		<>
			{ ! canConnectToZendesk && <ThirdPartyCookiesNotice /> }

			<div className="help-center-contact-support">
				<button
					disabled={ ! canConnectToZendesk || isOpeningZendeskWidget }
					onClick={ handleOnClick }
				>
					<div className="help-center-contact-support__box support" role="button" tabIndex={ 0 }>
						<div className="help-center-contact-support__box-icon">
							<Icon icon={ comment } />
						</div>
						<div>
							<h2>{ supportHeaderText }</h2>
							<p>{ __( 'Our Happiness team will get back to you soon', __i18n_text_domain__ ) }</p>
						</div>
					</div>
				</button>

				{ hasSubmittingError && (
					<FormInputValidation
						isError
						text={ __( 'Something went wrong, please try again later.', __i18n_text_domain__ ) }
					/>
				) }
			</div>
		</>
	);
};

export default HelpCenterContactSupportOption;
