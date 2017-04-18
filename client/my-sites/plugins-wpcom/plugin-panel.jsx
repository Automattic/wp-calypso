/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	getSelectedSite,
	getSelectedSiteId
} from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import {
	isPremium,
	isBusiness,
	isEnterprise
} from 'lib/products-values';
import JetpackPluginsPanel from './jetpack-plugins-panel';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { PLAN_BUSINESS, FEATURE_UPLOAD_PLUGINS } from 'lib/plans/constants';
import Banner from 'components/banner';
import { isATEnabled } from 'lib/automated-transfer';

export const PluginPanel = ( {
	plan,
	siteSlug,
	category,
	search,
	translate,
	atEnabled
} ) => {
	const hasBusiness = isBusiness( plan ) || isEnterprise( plan );
	const hasPremium = hasBusiness || isPremium( plan );

	return (
		<div className="plugins-wpcom__panel">

			<PageViewTracker path="/plugins/:site" title="Plugins > WPCOM Site" />

			{ atEnabled && ! hasBusiness &&
				<Banner
					feature={ FEATURE_UPLOAD_PLUGINS }
					plan={ PLAN_BUSINESS }
					title={ translate( 'Upgrade to the Business plan to install plugins.' ) }
				/>
			}

			<JetpackPluginsPanel { ...{
				siteSlug,
				hasBusiness,
				hasPremium,
				category,
				search,
			} } />

		</div>
	);
};

const mapStateToProps = state => {
	const selectedSite = getSelectedSite( state );
	return {
		atEnabled: isATEnabled( selectedSite ),
		plan: get( selectedSite, 'plan', {} ),
		siteSlug: getSiteSlug( state, getSelectedSiteId( state ) )
	};
};

export default connect( mapStateToProps )( localize( PluginPanel ) );
