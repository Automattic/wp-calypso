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
import config from 'config';
import { FEATURE_UPLOAD_PLUGINS } from 'lib/plans/constants';
import UpgradeNudge from 'my-sites/upgrade-nudge';

export const PluginPanel = ( {
	plan,
	siteSlug,
	category,
	search,
	translate,
} ) => {
	const hasBusiness = isBusiness( plan ) || isEnterprise( plan );
	const hasPremium = hasBusiness || isPremium( plan );

	return (
		<div className="plugins-wpcom__panel">

			<PageViewTracker path="/plugins/:site" title="Plugins > WPCOM Site" />

			{ config.isEnabled( 'automated-transfer' ) && ! hasBusiness &&
				<div className="plugins-wpcom__upgrade-nudge">
					<UpgradeNudge
						feature={ FEATURE_UPLOAD_PLUGINS }
						title={ translate( 'Upgrade to the Business plan to install third-party plugins.' ) }
						message={ translate( 'Upgrade to the Business plan to install plugins.' ) }
						event={ 'calypso_plugins_page_upgrade_nudge' }
					/>
				</div>
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

const mapStateToProps = state => ( {
	plan: get( getSelectedSite( state ), 'plan', {} ),
	siteSlug: getSiteSlug( state, getSelectedSiteId( state ) )
} );

export default connect( mapStateToProps )( localize( PluginPanel ) );
