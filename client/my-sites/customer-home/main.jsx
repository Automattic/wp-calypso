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
import isUnlaunchedSite from 'state/selectors/is-unlaunched-site';
import { getCurrentUser, isCurrentUserEmailVerified } from 'state/current-user/selectors';
import { getSelectedEditor } from 'state/selectors/get-selected-editor';
import QueryHomeLayout from 'components/data/query-home-layout';
import { getHomeLayout } from 'state/selectors/get-home-layout';
import Notices from 'my-sites/customer-home/locations/notices';
import Primary from 'my-sites/customer-home/locations/primary';
import Secondary from 'my-sites/customer-home/locations/secondary';
import Upsells from 'my-sites/customer-home/locations/upsells';

/**
 * Style dependencies
 */
import './style.scss';

const Home = ( {
	canUserUseCustomerHome,
	checklistMode,
	hasChecklistData,
	site,
	siteId,
	siteIsUnlaunched,
	trackAction,
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

	return (
		<Main className="customer-home__main is-wide-layout">
			<PageViewTracker path={ `/home/:site` } title={ translate( 'My Home' ) } />
			<DocumentHead title={ translate( 'My Home' ) } />
			{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
			{ siteId && <QueryHomeLayout siteId={ siteId } /> }
			<SidebarNavigation />
			<div className="customer-home__page-heading">
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
			</div>
			<Notices checklistMode={ checklistMode } />
			<Upsells />
			{ hasChecklistData ? (
				<div className="customer-home__layout">
					<div className="customer-home__layout-col customer-home__layout-col-left">
						<Primary checklistMode={ checklistMode } />
					</div>
					<div className="customer-home__layout-col customer-home__layout-col-right">
						<Secondary />
					</div>
				</div>
			) : (
				<div className="customer-home__loading-placeholder"></div>
			) }
		</Main>
	);
};

Home.propTypes = {
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

const connectHome = connect(
	state => {
		const siteId = getSelectedSiteId( state );
		const siteChecklist = getSiteChecklist( state, siteId );
		const hasChecklistData = null !== siteChecklist && Array.isArray( siteChecklist.tasks );
		const isChecklistComplete = isSiteChecklistComplete( state, siteId );
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

export default flowRight( connectHome, withTrackingTool( 'HotJar' ) )( Home );
