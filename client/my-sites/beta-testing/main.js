/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import { flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import Main from 'calypso/components/main';
import { Button } from '@automattic/components';
import { preventWidows } from 'calypso/lib/formatting';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import FormattedHeader from 'calypso/components/formatted-header';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { canCurrentUserUseCustomerHome, getSiteOption } from 'calypso/state/sites/selectors';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySiteChecklist from 'calypso/components/data/query-site-checklist';
import withTrackingTool from 'calypso/lib/analytics/with-tracking-tool';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';
import config from '@automattic/calypso-config';
/**
 * Style dependencies
 */
import './style.scss';

const BetaTesting = ( { siteId, trackViewHorizonAction } ) => {
	const translate = useTranslate();

	const header = (
		<div className="beta-testing__heading">
			<FormattedHeader
				brandFont
				headerText={ translate( 'Beta Testing' ) }
				subHeaderText={ translate(
					'Horizon is where the makers of WordPress.com test upcoming changes and new features with the WordPress.com community.'
				) }
				align="left"
				hasScreenOptions={ config.isEnabled( 'nav-unification/switcher' ) }
			/>
			<div className="beta-testing__view-horizon-button">
				<Button href="https://horizon.wordpress.com/" onClick={ trackViewHorizonAction }>
					{ translate( 'Visit Horizon' ) }
				</Button>
			</div>
		</div>
	);
	return (
		<Main wideLayout className="beta-testing__main">
			<PageViewTracker path={ `/beta-testing/:site` } title={ translate( 'Beta Testing' ) } />
			<DocumentHead title={ translate( 'Beta Testing' ) } />
			{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
			<SidebarNavigation />
			{ header }
		</Main>
	);
};

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );

	return {
		site: getSelectedSite( state ),
		siteId,
	};
};

const trackViewHorizonAction = ( isStaticHomePage ) =>
	composeAnalytics(
		recordTracksEvent( 'calypso_beta_testing_my_site_view_horizon_click', {
			is_static_home_page: isStaticHomePage,
		} ),
		bumpStat( 'calypso_beta_testing', 'my_site_view_horizon' )
	);

const mapDispatchToProps = {
	trackViewHorizonAction,
};

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	const { isStaticHomePage } = stateProps;
	return {
		...ownProps,
		...stateProps,
		trackViewHorizonAction: () => dispatchProps.trackViewHorizonAction( isStaticHomePage ),
	};
};

const connectBetaTesting = connect( mapStateToProps, mapDispatchToProps, mergeProps );

export default flowRight( connectBetaTesting )( BetaTesting );
