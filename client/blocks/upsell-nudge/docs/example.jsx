/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import UpsellNudge from 'blocks/upsell-nudge';

const UpsellNudgeExample = () => (
	<>
		<UpsellNudge
			forceDisplay
			href="#"
			callToAction="Upgrade"
			title="Free domain with a plan! This is a regular nudge with an icon."
			showIcon={ true }
		/>
		<UpsellNudge
			forceDisplay
			href="#"
			compact
			callToAction="Upgrade"
			title="Free domain with a plan! This is a compact nudge with no icon."
		/>
	</>
);

UpsellNudgeExample.displayName = 'UpsellNudge';

export default UpsellNudgeExample;
