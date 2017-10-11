/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { map } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CompactCard from 'components/card/compact';

// TODO: Cover all plans!

function getPersonalPlanFeatures( translate ) {
	return {
		backups: translate( 'Backups' ),
		antispam: translate( 'Antispam' ),
		stats: translate( 'Stats' ),
		publicize: translate( 'Publicize' ),
		subscriptions: translate( 'Subscriptions' ),
		other: translate( 'Other' ),
	};
}

const TooDifficult = ( { translate } ) => (
	<div>
		<Card className="disconnect-site__question">
			{ translate( 'Which feature or service caused you problems?' ) }
		</Card>
		{ map( getPersonalPlanFeatures( translate ), ( label, slug ) => (
			<CompactCard key={ slug }>{ label }</CompactCard>
		) ) }
	</div>
);

export default localize( TooDifficult );
