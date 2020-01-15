/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import UpsellNudge from 'blocks/upsell-nudge';

const UpsellNudgeExample = ( { translate } ) => (
	<>
		<UpsellNudge
			href="#"
			callToAction={ translate( 'Upgrade' ) }
			title={ translate( 'Free domain with a plan! This is a regular nudge with an icon.' ) }
			showIcon={ true }
		/>
		<UpsellNudge
			href="#"
			compact
			callToAction={ translate( 'Upgrade' ) }
			title={ translate( 'Free domain with a plan! This is a compact nudge with no icon.' ) }
		/>
	</>
);

const LocalizedUpsellNudgeExample = localize( UpsellNudgeExample );
LocalizedUpsellNudgeExample.displayName = 'UpsellNudge';

export default LocalizedUpsellNudgeExample;
