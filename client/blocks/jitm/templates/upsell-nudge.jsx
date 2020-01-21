/**
 * External Dependencies
 */

import React from 'react';
import { get } from 'lodash';

/**
 * Internal dependencies
 */

import UpsellNudge from 'blocks/upsell-nudge';

export default function UpsellNudgeTemplate( {
	id,
	CTA,
	event,
	featureClass,
	message,
	onClick,
	onDismiss,
	tracks,
	trackImpression,
	...props
} ) {
	const eventName = get( tracks, [ 'click', 'name' ] ) || `jitm_nudge_click_${ id }`;
	return (
		<>
			{ trackImpression && trackImpression() }
			<UpsellNudge
				callToAction={ CTA.message }
				compact
				dismissPreferenceName={ featureClass }
				event={ eventName }
				href={ CTA.link }
				onClick={ onClick }
				onDismissClick={ onDismiss }
				title={ message }
				tracksClickName={ eventName }
				tracksClickProperties={ get( tracks, [ 'click', 'props' ] ) }
				{ ...props }
			/>
		</>
	);
}
