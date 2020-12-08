/**
 * External Dependencies
 */
import React from 'react';
import { assign } from 'lodash';

/**
 * Internal dependencies
 */
import UpsellNudge from 'calypso/blocks/upsell-nudge';

export default function NoticeTemplate( { id, CTA, tracks, ...props } ) {
	const jitmProps = { id, cta_name: id, jitm: true };
	const tracksProps = {
		// CTA clicks
		tracksClickName: tracks?.click?.name ?? `jitm_nudge_click`,
		tracksClickProperties: assign( {}, jitmProps, tracks?.click?.props ),

		// Impression
		tracksImpressionName: tracks?.display?.name ?? `jitm_nudge_impression`,
		tracksImpressionProperties: assign( {}, jitmProps, tracks?.display?.props ),

		// Dismiss
		tracksDismissName: tracks?.dismiss?.name ?? `jitm_nudge_dismiss`,
		trackDismissProperties: assign( {}, jitmProps, tracks?.dismiss?.props ),
	};

	return (
		<UpsellNudge
			event={ id }
			title={ props.message }
			icon={ props.icon || 'info-outline' }
			showIcon={ !! props.icon }
			description={ props.description }
			href={ CTA.link }
			disableHref={ true }
			callToAction={ CTA.message }
			onClick={ props.onClick }
			onDismissClick={ props.onDismiss }
			dismissPreferenceName={ props.isDismissible ? id : '' }
			{ ...tracksProps }
		/>
	);
}
