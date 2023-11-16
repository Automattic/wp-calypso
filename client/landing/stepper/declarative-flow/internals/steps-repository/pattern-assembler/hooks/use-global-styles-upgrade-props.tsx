import { urlToSlug } from 'calypso/lib/url';
import useCheckout from '../../../../../hooks/use-checkout';
import { useSite } from '../../../../../hooks/use-site';
import { useSiteSlugParam } from '../../../../../hooks/use-site-slug-param';
import { PATTERN_ASSEMBLER_EVENTS } from '../events';
import type { ScreenName } from '../types';

interface Props {
	flowName: string;
	stepName: string;
	nextScreenName: ScreenName;
	onUpgradeLater?: () => void;
	recordTracksEvent: ( eventName: string, eventProps?: { [ key: string ]: unknown } ) => void;
}

const useGlobalStylesUpgradeProps = ( {
	flowName,
	stepName,
	nextScreenName,
	onUpgradeLater,
	recordTracksEvent,
}: Props ) => {
	const site = useSite();
	const siteSlug = useSiteSlugParam();
	const siteUrl = siteSlug || urlToSlug( site?.URL || '' ) || '';
	const { goToCheckout } = useCheckout();

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

	return {
		onCheckout: handleCheckout,
		onTryStyle: handleTryStyle,
	};
};

export default useGlobalStylesUpgradeProps;
