import { recordTracksEvent } from '@automattic/calypso-analytics';
import { getPlan } from '@automattic/calypso-products';
import { FormInputValidation } from '@automattic/components';
import { HelpCenterSite } from '@automattic/data-stores';
import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { useGetOdieStorage } from '@automattic/odie-client';
import { useOpenZendeskMessaging } from '@automattic/zendesk-client';
import { useDispatch } from '@wordpress/data';
import { hasTranslation } from '@wordpress/i18n';
import { Icon, comment } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo, useState } from 'react';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import useChatStatus from '../hooks/use-chat-status';
import { HELP_CENTER_STORE } from '../stores';
import { generateContactOnClickEvent } from './utils';

import './help-center-contact-support-option.scss';

interface HelpCenterContactSupportOptionProps {
	trackEventName?: string;
}

const HelpCenterContactSupportOption = ( {
	trackEventName,
}: HelpCenterContactSupportOptionProps ) => {
	const { __ } = useI18n();
	const isEnglishLocale = useIsEnglishLocale();
	const { sectionName, site } = useHelpCenterContext();
	const wapuuChatId = useGetOdieStorage( 'chat_id' );
	const { hasActiveChats, isEligibleForChat } = useChatStatus();
	const { resetStore, setShowHelpCenter } = useDispatch( HELP_CENTER_STORE );

	const { isOpeningZendeskWidget, openZendeskWidget } = useOpenZendeskMessaging(
		sectionName,
		'zendesk_support_chat_key',
		isEligibleForChat || hasActiveChats
	);

	const [ hasSubmittingError, setHasSubmittingError ] = useState< boolean >( false );

	const productSlug = ( site as HelpCenterSite )?.plan?.product_slug;
	const plan = getPlan( productSlug );
	const productId = plan?.getProductId();

	const liveChatHeaderText = useMemo( () => {
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

		const escapedWapuuChatId = encodeURIComponent( wapuuChatId || '' );

		openZendeskWidget( {
			aiChatId: escapedWapuuChatId,
			siteUrl: site?.URL,
			onError: () => setHasSubmittingError( true ),
			onSuccess: () => {
				resetStore();
				setShowHelpCenter( false );
			},
		} );
	};

	return (
		<div className="help-center-contact-support">
			<button disabled={ isOpeningZendeskWidget } onClick={ handleOnClick }>
				<div className="help-center-contact-support__box chat" role="button" tabIndex={ 0 }>
					<div className="help-center-contact-support__box-icon">
						<Icon icon={ comment } />
					</div>
					<div>
						<h2>{ liveChatHeaderText }</h2>
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
	);
};

export default HelpCenterContactSupportOption;
