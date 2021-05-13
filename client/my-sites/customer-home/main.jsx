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
import EmptyContent from 'calypso/components/empty-content';
import Main from 'calypso/components/main';
import { preventWidows } from 'calypso/lib/formatting';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import FormattedHeader from 'calypso/components/formatted-header';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { canCurrentUserUseCustomerHome } from 'calypso/state/sites/selectors';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySiteChecklist from 'calypso/components/data/query-site-checklist';
import withTrackingTool from 'calypso/lib/analytics/with-tracking-tool';
import QueryHomeLayout from 'calypso/components/data/query-home-layout';
import { getHomeLayout } from 'calypso/state/selectors/get-home-layout';
import Primary from 'calypso/my-sites/customer-home/locations/primary';
import Secondary from 'calypso/my-sites/customer-home/locations/secondary';
import Tertiary from 'calypso/my-sites/customer-home/locations/tertiary';
import { successNotice } from 'calypso/state/notices/actions';

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
	noticeType,
	shuffleViews,
} ) => {
	const translate = useTranslate();
	const reduxDispatch = useDispatch();

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

	return (
		<Main wideLayout className="customer-home__main">
			<PageViewTracker path={ `/home/:site` } title={ translate( 'My Home' ) } />
			<DocumentHead title={ translate( 'My Home' ) } />
			{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
			{ siteId && (
				<QueryHomeLayout
					siteId={ siteId }
					isDev={ isDev }
					forcedView={ forcedView }
					shuffle={ shuffleViews }
				/>
			) }
			<SidebarNavigation />
			<FormattedHeader
				brandFont
				headerText={ translate( 'My Home' ) }
				subHeaderText={ translate( 'Your hub for posting, editing, and growing your site.' ) }
				align="left"
			/>
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
	forcedView: PropTypes.string,
	layout: PropTypes.object,
	site: PropTypes.object.isRequired,
	siteId: PropTypes.number.isRequired,
	shuffleViews: PropTypes.bool,
};

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const layout = getHomeLayout( state, siteId );

	return {
		site: getSelectedSite( state ),
		siteId,
		canUserUseCustomerHome: canCurrentUserUseCustomerHome( state, siteId ),
		layout,
	};
};

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	return {
		...ownProps,
		...stateProps,
	};
};

const connectHome = connect( mapStateToProps, null, mergeProps );

export default flowRight( connectHome, withTrackingTool( 'HotJar' ) )( Home );
