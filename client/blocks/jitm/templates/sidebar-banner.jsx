import UpsellNudge from 'calypso/blocks/upsell-nudge';
import { preventWidows } from 'calypso/lib/formatting';

import './sidebar-banner.scss';

export default function SidebarBannerTemplate( { CTA, message, id, onDismiss, tracks, ...props } ) {
	const clickName = tracks?.click?.name ?? `jitm_nudge_click_${ id }`;
	const clickProps = tracks?.click?.props;

	const displayName = tracks?.display?.name ?? `jitm_nudge_impression_${ id }`;
	const displayProps = tracks?.display?.props;

	const dismissName = tracks?.dismiss?.name ?? `jitm_nudge_dismiss_${ id }`;
	const dismissProps = tracks?.dismiss?.props;

	const jitmProps = { id: id, jitm: true };

	return (
		<UpsellNudge
			callToAction={ CTA.message }
			compact
			event={ displayName }
			forceHref={ true }
			forceDisplay={ true }
			dismissPreferenceName={ props.isDismissible ? id : '' }
			href={ CTA.link }
			onDismissClick={ onDismiss }
			title={ preventWidows( message ) }
			tracksClickName={ clickName }
			tracksClickProperties={ { ...jitmProps, ...clickProps } }
			tracksImpressionName={ displayName }
			tracksImpressionProperties={ { ...jitmProps, ...displayProps } }
			tracksDismissName={ dismissName }
			tracksDismissProperties={ { ...jitmProps, ...dismissProps } }
		/>
	);
}
