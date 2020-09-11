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
			description="Domain registration is free for a year with purchase of a Premium or Business plan."
			forceDisplay
			href="#"
			callToAction="Upgrade"
			title="Free domain with a plan! This is a regular nudge with a description."
			showIcon={ true }
		/>
		<UpsellNudge
			description="Domain registration is free for a year with purchase of a Premium or Business plan."
			forceDisplay
			href="#"
			callToAction="Upgrade"
			title="Free domain with a plan! This is a regular nudge with a description."
			showIcon={ true }
		/>
		<UpsellNudge
			description="Domain registration is free for a year with purchase of a Premium or Business plan."
			dismissPreferenceName="calypso_upsell_nudge_devdocs_dismiss"
			forceDisplay
			href="#"
			callToAction="Upgrade"
			title="Free domain with a plan! This is a dismissible nudge with a description and the horizontal layout."
			showIcon={ true }
			horizontal
		/>
		<UpsellNudge
			description="Domain registration is free for a year with purchase of a Premium or Business plan."
			dismissPreferenceName="calypso_upsell_nudge_devdocs_dismiss"
			forceDisplay
			href="#"
			list={ [
				'24/7 live chat support',
				'Free domain with your plan purchase',
				'Extra customization options',
			] }
			callToAction="Upgrade"
			title="Free domain with a plan! This is a dismissible nudge with a description, prices, and a list of features."
			showIcon={ true }
			price={ [ 48, 50 ] }
		/>
		<UpsellNudge
			forceDisplay
			isJetpackDevDocs
			showIcon
			href="#"
			callToAction="Upgrade"
			title="Free domain with a plan! This is a Jetpack nudge."
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
