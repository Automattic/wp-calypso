/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import DocumentHead from 'components/data/document-head';
import page from 'page';
import { getPlanPath } from 'lib/plans';
import { PLAN_BUSINESS } from 'lib/plans/constants';

class PluginsUpsellComponent extends Component {
	static propTypes = {
		trackTracksEvent: PropTypes.func.isRequired,
		selectedSiteSlug: PropTypes.string.isRequired,
	};

	handleUpgradeButtonClick = () => {
		const { trackTracksEvent, selectedSiteSlug } = this.props;

		trackTracksEvent( 'calypso_upsell_landing_page_cta_click', {
			cta_name: 'plugins-upsell',
		} );

		page( `/checkout/${ selectedSiteSlug }/${ getPlanPath( PLAN_BUSINESS ) || '' }` );
	};

	render() {
		return (
			<div role="main" className="main is-wide-layout feature-upsell__main">
				<PageViewTracker path={ '/feature/plugins/:site' } title="PluginsUpsell" />
				<DocumentHead title={ 'Plugins' } />

				<header className="feature-upsell__header">
					<h1 className="feature-upsell__header-title">
						WordPress Plugins are now available on the Business plan.
					</h1>
					<p className="feature-upsell__header-subtitle">
						Upgrading to the Business plan unlocks access to more than 50,000 WordPress Plugins and
						197 premium Themes, making it our most powerful plan ever.
					</p>
				</header>

				<div className="feature-upsell__cta">
					<button
						onClick={ this.handleUpgradeButtonClick }
						className="button is-primary feature-upsell__cta-button"
					>
						Click here to upgrade your site to the Business plan now!
					</button>
				</div>
			</div>
		);
	}
}

const mapStateToProps = state => {
	const selectedSiteId = getSelectedSiteId( state );

	return {
		trackTracksEvent: recordTracksEvent,
		selectedSiteSlug: getSiteSlug( state, selectedSiteId ),
	};
};

export default connect( mapStateToProps )( localize( PluginsUpsellComponent ) );
