import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { urlToSlug } from 'calypso/lib/url';
import { usePremiumGlobalStyles } from 'calypso/state/sites/hooks/use-premium-global-styles';
import { useSite } from '../../../../../hooks/use-site';
import { useSiteSlugParam } from '../../../../../hooks/use-site-slug-param';
import { PATTERN_ASSEMBLER_EVENTS } from '../events';
import type { PremiumGlobalStylesUpgradeModalProps } from 'calypso/components/premium-global-styles-upgrade-modal';

interface Props {
	hasSelectedColorVariation?: boolean;
	hasSelectedFontVariation?: boolean;
	onCheckout?: () => void;
	recordTracksEvent: ( eventName: string, eventProps?: { [ key: string ]: unknown } ) => void;
}

const useGlobalStylesUpgradeModal = ( {
	hasSelectedColorVariation = false,
	hasSelectedFontVariation = false,
	onCheckout,
	recordTracksEvent,
}: Props ) => {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ isDismissed, setIsDismissed ] = useState( false );
	const site = useSite();
	const siteSlug = useSiteSlugParam();
	const siteUrl = siteSlug || urlToSlug( site?.URL || '' ) || '';
	const { shouldLimitGlobalStyles } = usePremiumGlobalStyles();
	const translate = useTranslate();

	const customizeDescription = ( description: JSX.Element ) => {
		return (
			<>
				<p>
					{ translate( "You've selected a premium color or font for your site." ) }
					&nbsp;
					{ description }
				</p>
				<p>
					{ translate(
						'You can also continue with your selected color or font and upgrade later.'
					) }
				</p>
			</>
		);
	};

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
		onCheckout?.();

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

	const upgradeLater = () => {
		recordTracksEvent(
			PATTERN_ASSEMBLER_EVENTS.GLOBAL_STYLES_GATING_MODAL_UPGRADE_LATER_BUTTON_CLICK
		);
		setIsDismissed( true );
		setIsOpen( false );
	};

	return {
		isDismissed,
		shouldUnlockGlobalStyles:
			( hasSelectedColorVariation || hasSelectedFontVariation ) && shouldLimitGlobalStyles,
		globalStylesUpgradeModalProps: {
			isOpen,
			tryItOutText: translate( 'Upgrade later' ),
			customizeDescription,
			closeModal,
			checkout,
			tryStyle: upgradeLater,
		} as PremiumGlobalStylesUpgradeModalProps,
		openModal,
	};
};

export default useGlobalStylesUpgradeModal;
