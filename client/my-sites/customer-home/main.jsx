import { Button } from '@automattic/components';
import { ExternalLink } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import SiteIcon from 'calypso/blocks/site-icon';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySiteChecklist from 'calypso/components/data/query-site-checklist';
import EmptyContent from 'calypso/components/empty-content';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import VideoModal from 'calypso/components/videos-ui/video-modal';
import { COURSE_SLUGS } from 'calypso/data/courses';
import useHomeLayoutQuery from 'calypso/data/home/use-home-layout-query';
import { addHotJarScript } from 'calypso/lib/analytics/hotjar';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import withTrackingTool from 'calypso/lib/analytics/with-tracking-tool';
import { preventWidows } from 'calypso/lib/formatting';
import { useRouteModal } from 'calypso/lib/route-modal';
import Primary from 'calypso/my-sites/customer-home/locations/primary';
import Secondary from 'calypso/my-sites/customer-home/locations/secondary';
import Tertiary from 'calypso/my-sites/customer-home/locations/tertiary';
import PluginsAnnouncementModal from 'calypso/my-sites/plugins/plugins-announcement-modal';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserCountryCode } from 'calypso/state/current-user/selectors';
import { getSelectedEditor } from 'calypso/state/selectors/get-selected-editor';
import isUserRegistrationDaysWithinRange from 'calypso/state/selectors/is-user-registration-days-within-range';
import {
	canCurrentUserUseCustomerHome,
	getSitePlanSlug,
	getSiteOption,
} from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import './style.scss';

const Home = ( {
	canUserUseCustomerHome,
	site,
	siteId,
	trackViewSiteAction,
	sitePlanSlug,
	isNew7DUser,
} ) => {
	const translate = useTranslate();

	const { data: layout, isLoading } = useHomeLayoutQuery( siteId );

	const { isModalOpen, openModal, closeModal } = useRouteModal(
		'myHomeCoursePaymentsModal',
		COURSE_SLUGS.PAYMENTS_FEATURES
	);

	const detectedCountryCode = useSelector( getCurrentUserCountryCode );
	useEffect( () => {
		if ( 'free_plan' !== sitePlanSlug ) {
			return;
		}

		if ( ! [ 'US', 'GB', 'AU', 'JP' ].includes( detectedCountryCode ) ) {
			return;
		}

		if ( isNew7DUser ) {
			return;
		}

		addHotJarScript();

		if ( window && window.hj ) {
			window.hj( 'trigger', 'pnp_survey_1' );
		}
	}, [ detectedCountryCode, sitePlanSlug, isNew7DUser ] );

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
				hasScreenOptions
			/>

			<div className="customer-home__site-content">
				<SiteIcon site={ site } size={ 58 } />
				<div className="customer-home__site-info">
					<div className="customer-home__site-title">{ site.name }</div>
					<ExternalLink
						href={ site.URL }
						className="customer-home__site-domain"
						onClick={ trackViewSiteAction }
					>
						<span className="customer-home__site-domain-text">{ site.domain }</span>
					</ExternalLink>
				</div>
			</div>

			<div className="customer-home__view-site-button">
				<Button href={ site.URL } onClick={ trackViewSiteAction } target="_blank">
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
			{ header }
			{ isLoading ? (
				<div className="customer-home__loading-placeholder"></div>
			) : (
				<>
					<Primary cards={ layout.primary } />
					<PluginsAnnouncementModal />
					<div className="customer-home__layout">
						<div className="customer-home__layout-col customer-home__layout-col-left">
							<Secondary cards={ layout.secondary } />
						</div>
						<div className="customer-home__layout-col customer-home__layout-col-right">
							<Tertiary cards={ layout.tertiary } />
						</div>
					</div>
					<div className="payments-features-video__modal">
						<VideoModal
							isVisible={ isModalOpen }
							onClose={ closeModal }
							onOpen={ openModal }
							courseSlug={ COURSE_SLUGS.PAYMENTS_FEATURES }
						/>
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
		sitePlanSlug: getSitePlanSlug( state, siteId ),
		siteId,
		isNew7DUser: isUserRegistrationDaysWithinRange( state, null, 0, 7 ),
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

export default connectHome( withTrackingTool( 'HotJar' )( Home ) );
