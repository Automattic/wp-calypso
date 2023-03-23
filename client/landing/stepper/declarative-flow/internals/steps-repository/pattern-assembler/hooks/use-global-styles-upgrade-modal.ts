import { useState } from 'react';
import { urlToSlug } from 'calypso/lib/url';
import { useSite } from '../../../../../hooks/use-site';
import { useSiteSlugParam } from '../../../../../hooks/use-site-slug-param';

interface Props {
	recordTracksEvent: ( eventName: string, eventProps?: { [ key: string ]: unknown } ) => void;
	onSubmit: () => void;
}

const useGlobalStylesUpgradeModal = ( { recordTracksEvent, onSubmit }: Props ) => {
	const [ isOpen, setIsOpen ] = useState( false );
	const site = useSite();
	const siteSlug = useSiteSlugParam();
	const siteUrl = siteSlug || urlToSlug( site?.URL || '' ) || '';

	const openModal = () => {
		recordTracksEvent( 'calypso_signup_pattern_assembler_global_styles_gating_modal_show' );
		setIsOpen( true );
	};

	const closeModal = () => {
		recordTracksEvent(
			'calypso_signup_pattern_assembler_global_styles_gating_modal_close_button_click'
		);
		setIsOpen( false );
	};

	const checkout = () => {
		recordTracksEvent(
			'calypso_signup_pattern_assembler_global_styles_gating_modal_checkout_button_click'
		);

		// When the user is done with checkout, send them back to the current url
		const destUrl = new URL( window.location.href );
		const redirectUrl = destUrl.toString().replace( window.location.origin, '' );
		const params = new URLSearchParams( {
			redirect_to: redirectUrl,
		} );

		// The theme upsell link does not work with siteId and requires a siteSlug.
		// See https://github.com/Automattic/wp-calypso/pull/64899
		window.location.href = `/checkout/${ encodeURIComponent( siteUrl ) }/premium?${ params }`;
	};

	const tryStyle = () => {
		recordTracksEvent(
			'calypso_signup_pattern_assembler_global_styles_gating_modal_try_button_click'
		);

		onSubmit();
	};

	return { isOpen, openModal, closeModal, checkout, tryStyle };
};

export default useGlobalStylesUpgradeModal;
