/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get, map, pick } from 'lodash';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import QuerySitePlans from 'components/data/query-site-plans';
import SectionHeader from 'components/section-header';
import { getSitePlanSlug } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getPlanClass } from 'lib/plans/constants';

function getFeatures( translate ) {
	return {
		backups: translate( 'Backups' ),
		security: translate( 'Security Scanning' ),
		antispam: translate( 'Antispam' ),
		stats: translate( 'Stats' ),
		publicize: translate( 'Publicize' ),
		subscriptions: translate( 'Subscriptions' ),
		other: translate( 'Other' ),
	};
}

const TooDifficult = ( { confirmHref, features, siteId, translate } ) => (
	<div>
		<QuerySitePlans siteId={ siteId } />
		<SectionHeader label={ translate( 'Which feature or service caused you problems?' ) } />
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
		const allFeatures = getFeatures( translate );

		const features = {
			'is-personal-plan': pick( allFeatures, [
				'backups',
				'antispam',
				'stats',
				'publicize',
				'subscriptions',
				'other',
			] ),
			'is-premium-plan': allFeatures,
			'is-business-plan': allFeatures,
		};

		return {
			features: get( features, planClass ),
			siteId,
		};
	} )( TooDifficult )
);
