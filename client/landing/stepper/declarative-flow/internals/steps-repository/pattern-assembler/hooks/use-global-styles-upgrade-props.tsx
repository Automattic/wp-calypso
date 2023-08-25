import { urlToSlug } from 'calypso/lib/url';
import { useSiteGlobalStylesStatus } from 'calypso/state/sites/hooks/use-site-global-styles-status';
import useCheckout from '../../../../../hooks/use-checkout';
import { useSite } from '../../../../../hooks/use-site';
import { useSiteSlugParam } from '../../../../../hooks/use-site-slug-param';
import { PATTERN_ASSEMBLER_EVENTS } from '../events';
import type { ScreenName } from '../types';

interface Props {
	flowName: string;
	stepName: string;
	hasSelectedColorVariation?: boolean;
	hasSelectedFontVariation?: boolean;
	resetCustomStyles?: boolean;
	nextScreenName: ScreenName;
	onUpgradeLater?: () => void;
	onContinue?: () => void;
	recordTracksEvent: ( eventName: string, eventProps?: { [ key: string ]: unknown } ) => void;
}

const useGlobalStylesUpgradeProps = ( {
	flowName,
	stepName,
	hasSelectedColorVariation = false,
	hasSelectedFontVariation = false,
	resetCustomStyles,
	nextScreenName,
	onUpgradeLater,
	onContinue,
	recordTracksEvent,
}: Props ) => {
	const site = useSite();
	const siteSlug = useSiteSlugParam();
	const siteUrl = siteSlug || urlToSlug( site?.URL || '' ) || '';
	const { shouldLimitGlobalStyles } = useSiteGlobalStylesStatus( site?.ID );
	const { goToCheckout } = useCheckout();
	const numOfSelectedGlobalStyles = [ hasSelectedColorVariation, hasSelectedFontVariation ].filter(
		Boolean
	).length;

	const handleCheckout = () => {
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.SCREEN_UPSELL_CHECKOUT_BUTTON_CLICK );

		// When the user is done with checkout, send them back to the next screen
		const searchParams = new URLSearchParams( window.location.search );
		searchParams.set( 'screen', nextScreenName );
		const redirectUrl = `${ window.location.pathname }?${ searchParams }`;

		goToCheckout( {
			flowName,
			stepName,
			siteSlug: siteUrl,
			destination: redirectUrl,
			plan: 'premium',
		} );
	};

	const handleTryStyle = () => {
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.SCREEN_UPSELL_UPGRADE_LATER_BUTTON_CLICK );
		onUpgradeLater?.();
	};

	const handleContinue = () => {
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.SCREEN_UPSELL_EDIT_YOUR_CONTENT_BUTTON_CLICK );
		onContinue?.();
	};

	return {
		shouldUnlockGlobalStyles:
			numOfSelectedGlobalStyles > 0 && shouldLimitGlobalStyles && ! resetCustomStyles,
		globalStylesInPersonalPlan,
		numOfSelectedGlobalStyles,
		onCheckout: handleCheckout,
		onTryStyle: handleTryStyle,
		onContinue: handleContinue,
	};
};

export default useGlobalStylesUpgradeProps;
