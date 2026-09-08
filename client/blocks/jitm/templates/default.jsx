import useIsCardVisible from 'calypso/blocks/dismissible-card/use-is-card-visible';
import UpsellNudge from 'calypso/blocks/upsell-nudge';

export default function DefaultTemplate( {
	id,
	CTA,
	message,
	description,
	featureClass,
	tracks,
	trackImpression,
	onClick,
	onDismiss,
} ) {
	const isBannerVisible = useIsCardVisible( featureClass );

	return (
		<>
			{ isBannerVisible && trackImpression && trackImpression() }
			<UpsellNudge
				callToAction={ CTA.message }
				title={ message }
				description={ description }
				disableHref
				dismissPreferenceName={ featureClass }
				dismissTemporary
				onDismissClick={ onDismiss }
				onClick={ onClick }
				event={ tracks?.click?.name || `jitm_nudge_click_${ id }` }
				href={ CTA.link }
				horizontal
				target={ CTA.target }
				showIcon
				forceDisplay
			/>
		</>
	);
}
