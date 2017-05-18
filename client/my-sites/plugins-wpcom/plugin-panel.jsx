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
import { canCurrentUser } from 'state/selectors';
import {
	isPremium,
	isBusiness,
	isEnterprise
} from 'lib/products-values';
import JetpackPluginsPanel from './jetpack-plugins-panel';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { PLAN_BUSINESS, FEATURE_UPLOAD_PLUGINS } from 'lib/plans/constants';
import Banner from 'components/banner';
import MainComponent from 'components/main';
import EmptyContent from 'components/empty-content';

export const PluginPanel = ( {
	plan,
	siteSlug,
	category,
	search,
	translate,
	canUserManageOptions,
} ) => {
	const hasBusiness = isBusiness( plan ) || isEnterprise( plan );
	const hasPremium = hasBusiness || isPremium( plan );

	if ( ! canUserManageOptions ) {
		const accessError = {
			title: translate( 'Not Available' ),
			line: translate( 'The page you requested could not be found' ),
			illustration: '/calypso/images/drake/drake-404.svg',
			fullWidth: true
		};
		return (
			<MainComponent>
				<EmptyContent { ...accessError } />
			</MainComponent>
		);
	}

	return (
		<div className="plugins-wpcom__panel">

			<PageViewTracker path="/plugins/:site" title="Plugins > WPCOM Site" />

			{ ! hasBusiness &&
				<Banner
					feature={ FEATURE_UPLOAD_PLUGINS }
					event={ 'calypso_plugins_page_upgrade_nudge' }
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
	const selectedSiteId = getSelectedSiteId( state );
	return {
		plan: get( selectedSite, 'plan', {} ),
		siteSlug: getSiteSlug( state, selectedSiteId ),
		canUserManageOptions: canCurrentUser( state, selectedSiteId, 'manage_options' ),
	};
};

export default connect( mapStateToProps )( localize( PluginPanel ) );
