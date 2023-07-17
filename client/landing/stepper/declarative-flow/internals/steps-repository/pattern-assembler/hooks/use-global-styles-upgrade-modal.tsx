import { useState } from 'react';
import { urlToSlug } from 'calypso/lib/url';
import { useSiteGlobalStylesStatus } from 'calypso/state/sites/hooks/use-site-global-styles-status';
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
	onUpgradeLater?: () => void;
	recordTracksEvent: ( eventName: string, eventProps?: { [ key: string ]: unknown } ) => void;
}

const useGlobalStylesUpgradeModal = ( {
	flowName,
	stepName,
	hasSelectedColorVariation = false,
	hasSelectedFontVariation = false,
	onCheckout,
	onUpgradeLater,
	recordTracksEvent,
}: Props ) => {
	const [ isOpen, setIsOpen ] = useState( false );
	const site = useSite();
	const siteSlug = useSiteSlugParam();
	const siteUrl = siteSlug || urlToSlug( site?.URL || '' ) || '';
	const { shouldLimitGlobalStyles, globalStylesInPersonalPlan } = useSiteGlobalStylesStatus(
		site?.ID
	);
	const { goToCheckout } = useCheckout();
	const numOfSelectedGlobalStyles = [ hasSelectedColorVariation, hasSelectedFontVariation ].filter(
		Boolean
	).length;

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
			plan: globalStylesInPersonalPlan ? 'personal' : 'premium',
		} );

		setIsOpen( false );
	};

	const upgradeLater = () => {
		recordTracksEvent(
			PATTERN_ASSEMBLER_EVENTS.GLOBAL_STYLES_GATING_MODAL_UPGRADE_LATER_BUTTON_CLICK
		);
		onUpgradeLater?.();
		setIsOpen( false );
	};

	return {
		shouldUnlockGlobalStyles: numOfSelectedGlobalStyles > 0 && shouldLimitGlobalStyles,
		globalStylesUpgradeModalProps: {
			isOpen,
			numOfSelectedGlobalStyles,
			closeModal,
			checkout,
			tryStyle: upgradeLater,
		} as PremiumGlobalStylesUpgradeModalProps,
		openModal,
	};
};

export default useGlobalStylesUpgradeModal;
