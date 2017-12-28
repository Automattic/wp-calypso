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
import CompactCard from 'client/components/card/compact';
import QuerySitePlans from 'client/components/data/query-site-plans';
import SectionHeader from 'client/components/section-header';
import { getSitePlanSlug } from 'client/state/sites/selectors';
import { getSelectedSiteId } from 'client/state/ui/selectors';
import { getPlanClass } from 'client/lib/plans/constants';
import { addQueryArgs } from 'client/lib/url';

function getFeatures( planClass, translate ) {
	const features = {
		backups: translate( 'Backups' ),
		security: translate( 'Security Scanning' ),
		antispam: translate( 'Antispam' ),
		stats: translate( 'Stats' ),
		publicize: translate( 'Publicize' ),
		subscriptions: translate( 'Subscriptions' ),
		other: translate( 'Other' ),
	};
	return get(
		{
			'is-free-plan': pick( features, [ 'stats', 'publicize', 'subscriptions', 'other' ] ),
			'is-personal-plan': pick( features, [
				'backups',
				'antispam',
				'stats',
				'publicize',
				'subscriptions',
				'other',
			] ),
			'is-premium-plan': features,
			'is-business-plan': features,
		},
		planClass
	);
}

const TooDifficult = ( { confirmHref, features, siteId, translate } ) => (
	<div>
		<QuerySitePlans siteId={ siteId } />
		<SectionHeader label={ translate( 'Which feature or service caused you problems?' ) } />
		{ map( features, ( label, slug ) => (
			<CompactCard
				key={ slug }
				href={ addQueryArgs(
					{
						reason: 'too-difficult',
						text: slug,
					},
					confirmHref
				) }
			>
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

		return {
			features: getFeatures( planClass, translate ),
			siteId,
		};
	} )( TooDifficult )
);
