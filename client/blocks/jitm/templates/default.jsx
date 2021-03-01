/**
 * External Dependencies
 */
import React from 'react';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
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
	return (
		<>
			{ trackImpression && trackImpression() }
			<UpsellNudge
				callToAction={ CTA.message }
				title={ message }
				description={ description }
				disableHref
				dismissPreferenceName={ featureClass }
				dismissTemporary={ true }
				onDismiss={ onDismiss }
				onClick={ onClick }
				event={ get( tracks, [ 'click', 'name' ] ) || `jitm_nudge_click_${ id }` }
				href={ CTA.link }
				horizontal
				target={ '_blank' }
				showIcon={ true }
				forceDisplay
			/>
		</>
	);
}
