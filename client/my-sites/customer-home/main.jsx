/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import { flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import EmptyContent from 'calypso/components/empty-content';
import Main from 'calypso/components/main';
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
import { getSelectedEditor } from 'calypso/state/selectors/get-selected-editor';
import QueryHomeLayout from 'calypso/components/data/query-home-layout';
import { getHomeLayout } from 'calypso/state/selectors/get-home-layout';
import Primary from 'calypso/my-sites/customer-home/locations/primary';
import Secondary from 'calypso/my-sites/customer-home/locations/secondary';
import Tertiary from 'calypso/my-sites/customer-home/locations/tertiary';
import notices from 'calypso/notices';

/**
 * Style dependencies
 */
import './style.scss';

const Home = ( {
	canUserUseCustomerHome,
	isDev,
	forcedView,
	layout,
	site,
	siteId,
	trackViewSiteAction,
	noticeType,
} ) => {
	const translate = useTranslate();

	if ( ! canUserUseCustomerHome ) {
		const title = translate( 'This page is not available on this site.' );
		return (
			<EmptyContent
				title={ preventWidows( title ) }
				illustration="/calypso/images/illustrations/error.svg"
			/>
		);
	}

	if ( 'difm_success' === noticeType ) {
		const successMessage = translate( 'Your application has been sent!' );
		notices.success( successMessage, {
			persistent: true,
		} );
	}

	const header = (
		<div className="customer-home__heading">
			<FormattedHeader
				brandFont
				headerText={ translate( 'My Home' ) }
				subHeaderText={ translate( 'Your home base for posting, editing, and growing your site.' ) }
				align="left"
			/>
			<div className="customer-home__view-site-button">
				<Button href={ site.URL } onClick={ trackViewSiteAction }>
					{ translate( 'Visit site' ) }
				</Button>
			</div>
		</div>
	);

	return (
		<Main className="customer-home__main is-wide-layout">
			<PageViewTracker path={ `/home/:site` } title={ translate( 'My Home' ) } />
			<DocumentHead title={ translate( 'My Home' ) } />
			{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
			{ siteId && <QueryHomeLayout siteId={ siteId } isDev={ isDev } forcedView={ forcedView } /> }
			<SidebarNavigation />
			{ header }
			{ layout ? (
				<>
					<Primary cards={ layout.primary } />
					<div className="customer-home__layout">
						<div className="customer-home__layout-col customer-home__layout-col-left">
							<Secondary cards={ layout.secondary } />
						</div>
						<div className="customer-home__layout-col customer-home__layout-col-right">
							<Tertiary cards={ layout.tertiary } />
						</div>
					</div>
				</>
			) : (
				<div className="customer-home__loading-placeholder"></div>
			) }
		</Main>
	);
};

Home.propTypes = {
	canUserUseCustomerHome: PropTypes.bool.isRequired,
	isDev: PropTypes.bool,
	isStaticHomePage: PropTypes.bool.isRequired,
	forcedView: PropTypes.string,
	layout: PropTypes.object,
	site: PropTypes.object.isRequired,
	siteId: PropTypes.number.isRequired,
	trackViewSiteAction: PropTypes.func.isRequired,
};

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const isClassicEditor = getSelectedEditor( state, siteId ) === 'classic';
	const layout = getHomeLayout( state, siteId );

	return {
		site: getSelectedSite( state ),
		siteId,
		canUserUseCustomerHome: canCurrentUserUseCustomerHome( state, siteId ),
		isStaticHomePage:
			! isClassicEditor && 'page' === getSiteOption( state, siteId, 'show_on_front' ),
		layout,
	};
};

const trackViewSiteAction = ( isStaticHomePage ) =>
	composeAnalytics(
		recordTracksEvent( 'calypso_customer_home_my_site_view_site_click', {
			is_static_home_page: isStaticHomePage,
		} ),
		bumpStat( 'calypso_customer_home', 'my_site_view_site' )
	);

const mapDispatchToProps = {
	trackViewSiteAction,
};

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	const { isStaticHomePage } = stateProps;
	return {
		...ownProps,
		...stateProps,
		trackViewSiteAction: () => dispatchProps.trackViewSiteAction( isStaticHomePage ),
	};
};

const connectHome = connect( mapStateToProps, mapDispatchToProps, mergeProps );

export default flowRight( connectHome, withTrackingTool( 'HotJar' ) )( Home );
