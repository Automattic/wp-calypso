import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@wordpress/components';
import { useThemeTierBadgeContext } from './theme-tier-badge-context';

export default function ThemeTierBadgeCheckoutLink( { children, plan } ) {
	const { canGoToCheckout, siteSlug } = useThemeTierBadgeContext();

	if ( ! canGoToCheckout || ! siteSlug ) {
		return <>{ children }</>;
	}

	const goToCheckout = () => {
		recordTracksEvent( 'calypso_theme_tooltip_upgrade_nudge_click', { plan } );

		const params = new URLSearchParams();
		params.append( 'redirect_to', window.location.href.replace( window.location.origin, '' ) );

		window.location.href = `/checkout/${ encodeURIComponent(
			siteSlug
		) }/${ plan }?${ params.toString() }`;
	};

	return (
		<Button variant="link" onClick={ goToCheckout }>
			{ children }
		</Button>
	);
}
