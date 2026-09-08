import useIsCardVisible from 'calypso/blocks/dismissible-card/use-is-card-visible';
import UpsellNudge from 'calypso/blocks/upsell-nudge';

import './sidebar-banner.scss';

export default function SidebarBannerTemplate( {
	CTA,
	message,
	id,
	onClick,
	onDismiss,
	isDismissible = false,
	trackImpression,
} ) {
	let dismissPreferenceName = '';
	let forceHref = true;
	if ( isDismissible ) {
		// Don't force the whole banner to be a link - the whole thing can't be a link when it has a dismiss and a link
		forceHref = false;
		dismissPreferenceName = id;
	}

	const isBannerVisible = useIsCardVisible( dismissPreferenceName );

	return (
		<>
			<UpsellNudge
				callToAction={ CTA.message }
				compact
				forceHref={ forceHref }
				forceDisplay
				dismissPreferenceName={ dismissPreferenceName }
				dismissTemporary
				href={ CTA.link }
				onClick={ onClick }
				onDismissClick={ onDismiss }
				title={ message }
			/>
			{ isBannerVisible && trackImpression && trackImpression() }
		</>
	);
}
