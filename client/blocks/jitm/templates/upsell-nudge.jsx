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
	trackImpression,
	tracks,
	...props
} ) {
	const clickName = get( tracks, [ 'click', 'name' ] ) || `jitm_nudge_click_${ id }`;
	const clickProps = get( tracks, [ 'click', 'props' ] );
	const displayName = get( tracks, [ 'display', 'name' ] ) || `jitm_nudge_impression_${ id }`;
	const displayProps = get( tracks, [ 'display', 'props' ] );
	const jitmProps = { id: id, jitm: true };
	return (
		<>
			<UpsellNudge
				callToAction={ CTA.message }
				compact
				event={ displayName }
				href={ CTA.link }
				onClick={ onClick }
				title={ message }
				tracksClickName={ clickName }
				tracksClickProperties={ { ...jitmProps, ...clickProps } }
				tracksImpressionName={ displayName }
				tracksImpressionProperties={ { ...jitmProps, ...displayProps } }
				{ ...props }
			/>
		</>
	);
}
