/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import UpsellNudge from 'blocks/upsell-nudge';

export default function UpsellNudgeTemplate( { CTA, event, message, onClick, onDismiss, tracksImpressionName, ...props } ) {
	return (
		<UpsellNudge
			callToAction={ CTA.message }
			compact
			event={ tracksImpressionName }
			href={ CTA.link }
			onClick={ onClick }
			onDismissClick={ onDismiss }
			title={ message }
			{ ...props }
		/>
	);
}