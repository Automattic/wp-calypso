import { useState } from 'react';
import { urlToSlug } from 'calypso/lib/url';
import { useSite } from '../../../../../hooks/use-site';
import { useSiteSlugParam } from '../../../../../hooks/use-site-slug-param';
import { PATTERN_ASSEMBLER_EVENTS } from '../events';

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
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.GLOBAL_STYLES_GATING_MODAL_SHOW );
		setIsOpen( true );
	};

	const closeModal = () => {
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.GLOBAL_STYLES_GATING_MODAL_CLOSE_BUTTON_CLICK );
		setIsOpen( false );
	};

	const checkout = () => {
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.GLOBAL_STYLES_GATING_MODAL_CHECKOUT_BUTTON_CLICK );

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
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.GLOBAL_STYLES_GATING_MODAL_TRY_BUTTON_CLICK );
		onSubmit();
	};

	return { isOpen, openModal, closeModal, checkout, tryStyle };
};

export default useGlobalStylesUpgradeModal;
