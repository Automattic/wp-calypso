/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get, map } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import QuerySitePlans from 'components/data/query-site-plans';
import { getSitePlanSlug } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getPlanClass } from 'lib/plans/constants';

const TooDifficult = ( { confirmHref, features, siteId, translate } ) => (
	<div>
		<QuerySitePlans siteId={ siteId } />
		<Card className="disconnect-site__question">
			{ translate( 'Which feature or service caused you problems?' ) }
		</Card>
		{ map( features, ( label, slug ) => (
			<CompactCard key={ slug } href={ confirmHref }>
				{ label }
			</CompactCard>
		) ) }
	</div>
);

export default localize(
	connect( ( state, { translate } ) => {
		const siteId = getSelectedSiteId( state );
		const planSlug = getSitePlanSlug( state, siteId );
		const planClass = getPlanClass( planSlug );

		const features = {
			'is-personal-plan': {
				backups: translate( 'Backups' ),
				antispam: translate( 'Antispam' ),
				stats: translate( 'Stats' ),
				publicize: translate( 'Publicize' ),
				subscriptions: translate( 'Subscriptions' ),
				other: translate( 'Other' ),
			},
			'is-premium-plan': {
				backups: translate( 'Backups' ),
				security: translate( 'Security Scanning' ),
				antispam: translate( 'Antispam' ),
				stats: translate( 'Stats' ),
				publicize: translate( 'Publicize' ),
				subscriptions: translate( 'Subscriptions' ),
				other: translate( 'Other' ),
			},
			'is-business-plan': {
				backups: translate( 'Backups' ),
				security: translate( 'Security Scanning' ),
				antispam: translate( 'Antispam' ),
				stats: translate( 'Stats' ),
				publicize: translate( 'Publicize' ),
				subscriptions: translate( 'Subscriptions' ),
				other: translate( 'Other' ),
			},
		};

		return {
			features: get( features, planClass ),
			siteId,
		};
	} )( TooDifficult )
);
