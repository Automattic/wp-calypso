/**
 * External dependencies
 */
import { isMobile } from '@automattic/viewport';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import CardHeading from 'components/card-heading';
import EmptyContent from 'components/empty-content';
import Main from 'components/main';
import { preventWidows } from 'lib/formatting';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import FormattedHeader from 'components/formatted-header';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { canCurrentUserUseCustomerHome, getSiteOption } from 'state/sites/selectors';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import DocumentHead from 'components/data/document-head';
import getSiteChecklist from 'state/selectors/get-site-checklist';
import isSiteChecklistComplete from 'state/selectors/is-site-checklist-complete';
import QuerySiteChecklist from 'components/data/query-site-checklist';
import withTrackingTool from 'lib/analytics/with-tracking-tool';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'state/analytics/actions';
import StatsBanners from 'my-sites/stats/stats-banners';
import isUnlaunchedSite from 'state/selectors/is-unlaunched-site';
import { getCurrentUser, isCurrentUserEmailVerified } from 'state/current-user/selectors';
import GoMobile from 'my-sites/customer-home/cards/features/go-mobile';
import GrowEarn from 'my-sites/customer-home/cards/features/grow-earn';
import LaunchSite from 'my-sites/customer-home/cards/features/launch-site';
import Stats from 'my-sites/customer-home/cards/features/stats';
import FreePhotoLibrary from 'my-sites/customer-home/cards/education/free-photo-library';
import { getSelectedEditor } from 'state/selectors/get-selected-editor';
import QueryHomeLayout from 'components/data/query-home-layout';
import { getHomeLayout } from 'state/selectors/get-home-layout';
import Primary from 'my-sites/customer-home/locations/primary';
import Notices from 'my-sites/customer-home/locations/notices';
import Support from 'my-sites/customer-home/cards/features/support';

/**
 * Style dependencies
 */
import './style.scss';

class Home extends Component {
	static propTypes = {
		checklistMode: PropTypes.string,
		site: PropTypes.object.isRequired,
		siteId: PropTypes.number.isRequired,
		siteSlug: PropTypes.string.isRequired,
		canUserUseCustomerHome: PropTypes.bool.isRequired,
		hasChecklistData: PropTypes.bool.isRequired,
		isChecklistComplete: function( props, propName, componentName ) {
			const propValue = props[ propName ]; // the actual value of `isChecklistComplete`
			if ( null !== propValue && 'boolean' !== typeof propValue ) {
				return new Error(
					`isChecklistComplete prop of ${ componentName } only accepts null or Boolean.`
				);
			}
		},
		trackAction: PropTypes.func.isRequired,
		isStaticHomePage: PropTypes.bool.isRequired,
	};

	renderCustomerHomeHeader() {
		const { translate, site, siteIsUnlaunched, trackAction } = this.props;

		return (
			<div className="customer-home__heading">
				<FormattedHeader
					headerText={ translate( 'My Home' ) }
					subHeaderText={ translate(
						'Your home base for all the posting, editing, and growing of your site'
					) }
					align="left"
				/>
				{ ! siteIsUnlaunched && (
					<div className="customer-home__view-site-button">
						<Button href={ site.URL } onClick={ () => trackAction( 'my_site', 'view_site' ) }>
							{ translate( 'View site' ) }
						</Button>
					</div>
				) }
			</div>
		);
	}

	render() {
		const {
			checklistMode,
			translate,
			canUserUseCustomerHome,
			siteSlug,
			siteId,
			isChecklistComplete,
			siteIsUnlaunched,
			isEstablishedSite,
		} = this.props;

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
			<Main className="customer-home__main is-wide-layout">
				<PageViewTracker path={ `/home/:site` } title={ translate( 'My Home' ) } />
				<DocumentHead title={ translate( 'My Home' ) } />
				{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
				{ siteId && <QueryHomeLayout siteId={ siteId } /> }
				<SidebarNavigation />
				<div className="customer-home__page-heading">{ this.renderCustomerHomeHeader() }</div>
				<Notices checklistMode={ checklistMode } />
				{ //Only show upgrade nudges to sites > 2 days old
				isEstablishedSite && (
					<div className="customer-home__upsells">
						<StatsBanners
							siteId={ siteId }
							slug={ siteSlug }
							primaryButton={ isChecklistComplete && ! siteIsUnlaunched ? true : false }
						/>
					</div>
				) }
				{ this.renderCustomerHome() }
			</Main>
		);
	}

	renderCustomerHome = () => {
		const {
			isChecklistComplete,
			needsEmailVerification,
			translate,
			checklistMode,
			hasChecklistData,
			siteIsUnlaunched,
		} = this.props;

		if ( ! hasChecklistData ) {
			return <div className="customer-home__loading-placeholder"></div>;
		}

		return (
			<div className="customer-home__layout">
				<div className="customer-home__layout-col customer-home__layout-col-left">
					<Primary checklistMode={ checklistMode } />
				</div>
				<div className="customer-home__layout-col customer-home__layout-col-right">
					{ siteIsUnlaunched && ! needsEmailVerification && <LaunchSite /> }
					{ ! siteIsUnlaunched && <Stats /> }
					{ <FreePhotoLibrary /> }
					{ ! siteIsUnlaunched && isChecklistComplete && <GrowEarn /> }
					<Support />
					{ // "Go Mobile" has the lowest priority placement when viewed in bigger viewports.
					! isMobile() && <GoMobile /> }
				</div>
			</div>
		);
	};
}

const connectHome = connect(
	state => {
		const siteId = getSelectedSiteId( state );
		const siteChecklist = getSiteChecklist( state, siteId );
		const hasChecklistData = null !== siteChecklist && Array.isArray( siteChecklist.tasks );
		const isChecklistComplete = isSiteChecklistComplete( state, siteId );
		const createdAt = getSiteOption( state, siteId, 'created_at' );
		const user = getCurrentUser( state );
		const isClassicEditor = getSelectedEditor( state, siteId ) === 'classic';

		return {
			site: getSelectedSite( state ),
			siteId,
			siteSlug: getSelectedSiteSlug( state ),
			canUserUseCustomerHome: canCurrentUserUseCustomerHome( state, siteId ),
			hasChecklistData,
			isChecklistComplete,
			needsEmailVerification: ! isCurrentUserEmailVerified( state ),
			isStaticHomePage:
				! isClassicEditor && 'page' === getSiteOption( state, siteId, 'show_on_front' ),
			isEstablishedSite: moment().isAfter( moment( createdAt ).add( 2, 'days' ) ),
			siteIsUnlaunched: isUnlaunchedSite( state, siteId ),
			user,
			cards: getHomeLayout( state, siteId ),
		};
	},
	dispatch => ( {
		trackAction: ( section, action, isStaticHomePage ) =>
			dispatch(
				composeAnalytics(
					recordTracksEvent( `calypso_customer_home_${ section }_${ action }_click`, {
						is_static_home_page: isStaticHomePage,
					} ),
					bumpStat( 'calypso_customer_home', `${ section }_${ action }` )
				)
			),
	} ),
	( stateProps, dispatchProps, ownProps ) => ( {
		...stateProps,
		...ownProps,
		trackAction: ( section, action ) =>
			dispatchProps.trackAction( section, action, stateProps.isStaticHomePage ),
	} )
);

export default flowRight( connectHome, localize, withTrackingTool( 'HotJar' ) )( Home );
