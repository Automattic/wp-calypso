/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import UpsellNudge from 'blocks/upsell-nudge';
import { preventWidows } from 'lib/formatting';

/**
 * Style dependencies
 */
import './sidebar-banner.scss';

export default function SidebarBannerTemplate( {
	CTA,
	message,
	id,
	dismissPreferenceName,
	onDismissClick,
	tracks,
	tracksDismissName,
	tracksDismissProperties,
} ) {
	const clickName = tracks?.click?.name ?? `jitm_nudge_click_${ id }`;
	const clickProps = tracks?.click?.props;
	const displayName = tracks?.display?.name ?? `jitm_nudge_impression_${ id }`;
	const displayProps = tracks?.display?.props;
	const jitmProps = { id: id, jitm: true };

	return (
		<UpsellNudge
			callToAction={ CTA.message }
			compact
			event={ displayName }
			forceHref={ true }
			forceDisplay={ true }
			dismissPreferenceName={ dismissPreferenceName }
			href={ CTA.link }
			onDismissClick={ onDismissClick }
			title={ preventWidows( message ) }
			tracksClickName={ clickName }
			tracksClickProperties={ { ...jitmProps, ...clickProps } }
			tracksImpressionName={ displayName }
			tracksImpressionProperties={ { ...jitmProps, ...displayProps } }
			tracksDismissName={ tracksDismissName }
			tracksDismissProperties={ { ...jitmProps, ...tracksDismissProperties } }
		/>
	);
}
