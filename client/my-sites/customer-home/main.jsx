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
import Primary from 'calypso/my-sites/customer-home/locations/primary';
import Secondary from 'calypso/my-sites/customer-home/locations/secondary';
import Tertiary from 'calypso/my-sites/customer-home/locations/tertiary';
import { successNotice } from 'calypso/state/notices/actions';
import config from '@automattic/calypso-config';
import useHomeLayoutQuery from 'calypso/data/home/use-home-layout-query';

/**
 * Style dependencies
 */
import './style.scss';

const Home = ( { canUserUseCustomerHome, site, siteId, trackViewSiteAction, noticeType } ) => {
	const translate = useTranslate();
	const reduxDispatch = useDispatch();

	const { data: layout, isLoading } = useHomeLayoutQuery( siteId );

	const shouldShowNotice = Boolean( canUserUseCustomerHome && layout && noticeType );
	const lastShownNotice = useRef( null );
	useEffect( () => {
		if ( ! shouldShowNotice || lastShownNotice.current === noticeType ) {
			return;
		}

		if ( noticeType === 'purchase-success' ) {
			lastShownNotice.current = noticeType;
			const successMessage = translate( 'Your purchase has been completed!' );
			reduxDispatch( successNotice( successMessage ) );
			return;
		}

		return;
	}, [ shouldShowNotice, translate, reduxDispatch, noticeType ] );

	if ( ! canUserUseCustomerHome ) {
		const title = translate( 'This page is not available on this site.' );
		return (
			<EmptyContent
				title={ preventWidows( title ) }
				illustration="/calypso/images/illustrations/error.svg"
			/>
		);
	}

	const header = (
		<div className="customer-home__heading">
			<FormattedHeader
				brandFont
				headerText={ translate( 'My Home' ) }
				subHeaderText={ translate( 'Your hub for posting, editing, and growing your site.' ) }
				align="left"
				hasScreenOptions={ config.isEnabled( 'nav-unification/switcher' ) }
			/>
			<div className="customer-home__view-site-button">
				<Button href={ site.URL } onClick={ trackViewSiteAction }>
					{ translate( 'Visit site' ) }
				</Button>
			</div>
		</div>
	);

	return (
		<Main wideLayout className="customer-home__main">
			<PageViewTracker path={ `/home/:site` } title={ translate( 'My Home' ) } />
			<DocumentHead title={ translate( 'My Home' ) } />
			{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
			<SidebarNavigation />
			{ header }
			{ isLoading ? (
				<div className="customer-home__loading-placeholder"></div>
			) : (
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
			) }
		</Main>
	);
};

Home.propTypes = {
	canUserUseCustomerHome: PropTypes.bool.isRequired,
	isStaticHomePage: PropTypes.bool.isRequired,
	site: PropTypes.object.isRequired,
	siteId: PropTypes.number.isRequired,
	trackViewSiteAction: PropTypes.func.isRequired,
};

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const isClassicEditor = getSelectedEditor( state, siteId ) === 'classic';

	return {
		site: getSelectedSite( state ),
		siteId,
		canUserUseCustomerHome: canCurrentUserUseCustomerHome( state, siteId ),
		isStaticHomePage:
			! isClassicEditor && 'page' === getSiteOption( state, siteId, 'show_on_front' ),
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
