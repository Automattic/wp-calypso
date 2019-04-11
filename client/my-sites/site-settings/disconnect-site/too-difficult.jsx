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
import SettingsSectionHeader from 'my-sites/site-settings/settings-section-header';
import { getSitePlanSlug } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getPlanClass } from 'lib/plans';
import { addQueryArgs } from 'lib/url';

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
		<SettingsSectionHeader title={ translate( 'Which feature or service caused you problems?' ) } />
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
