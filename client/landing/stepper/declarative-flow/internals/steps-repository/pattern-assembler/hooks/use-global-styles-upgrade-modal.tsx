import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { urlToSlug } from 'calypso/lib/url';
import { usePremiumGlobalStyles } from 'calypso/state/sites/hooks/use-premium-global-styles';
import useCheckout from '../../../../../hooks/use-checkout';
import { useSite } from '../../../../../hooks/use-site';
import { useSiteSlugParam } from '../../../../../hooks/use-site-slug-param';
import { PATTERN_ASSEMBLER_EVENTS } from '../events';
import type { PremiumGlobalStylesUpgradeModalProps } from 'calypso/components/premium-global-styles-upgrade-modal';

interface Props {
	flowName: string;
	stepName: string;
	hasSelectedColorVariation?: boolean;
	hasSelectedFontVariation?: boolean;
	onCheckout?: () => void;
	recordTracksEvent: ( eventName: string, eventProps?: { [ key: string ]: unknown } ) => void;
}

const useGlobalStylesUpgradeModal = ( {
	flowName,
	stepName,
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
	const { shouldLimitGlobalStyles } = usePremiumGlobalStyles( site?.ID );
	const translate = useTranslate();
	const { goToCheckout } = useCheckout();

	const customizeDescription = () => {
		let description;

		if ( hasSelectedColorVariation && hasSelectedFontVariation ) {
			description = translate(
				'Your font and color choices are exclusive to the Premium plan and above.'
			);
		} else if ( hasSelectedColorVariation ) {
			description = translate( 'Your color choices are exclusive to the Premium plan and above.' );
		} else if ( hasSelectedFontVariation ) {
			description = translate( 'Your font choices are exclusive to the Premium plan and above.' );
		}

		return (
			<p>
				{ description }
				&nbsp;
				{ translate( 'You can upgrade now to keep your current choices, or upgrade later.' ) }
			</p>
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
		const redirectUrl = window.location.href.replace( window.location.origin, '' );

		goToCheckout( {
			flowName,
			stepName,
			siteSlug: siteUrl,
			destination: redirectUrl,
			plan: 'premium',
		} );

		setIsOpen( false );
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
			title: translate( 'Unlock custom styles' ),
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
