/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import Banner from 'components/banner';
import Button from 'components/button';
import Card from 'components/card';
import CardHeading from 'components/card-heading';
import EmptyContent from 'components/empty-content';
import ChecklistWpcom from 'my-sites/checklist/main';
import Main from 'components/main';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';
import { preventWidows } from 'lib/formatting';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { getCustomizerUrl, canCurrentUserUseCustomerHome } from 'state/sites/selectors';
import isSiteEligibleForCustomerHome from 'state/selectors/is-site-eligible-for-customer-home';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import DocumentHead from 'components/data/document-head';
import getSiteChecklist from 'state/selectors/get-site-checklist';
import isSiteChecklistComplete from 'state/selectors/is-site-checklist-complete';
import QuerySiteChecklist from 'components/data/query-site-checklist';

/**
 * Style dependencies
 */
import './style.scss';

const ActionBox = ( { href, onClick, iconSrc, label } ) => {
	const buttonAction = { href, onClick };
	return (
		<div className="customer-home__box-action">
			<Button { ...buttonAction }>
				<img src={ iconSrc } alt="" />
				<span>{ label }</span>
			</Button>
		</div>
	);
};

class Home extends Component {
	static propTypes = {
		checklistMode: PropTypes.string,

		site: PropTypes.object.isRequired,
		siteId: PropTypes.number.isRequired,
		siteSlug: PropTypes.string.isRequired,
		customizeUrl: PropTypes.string.isRequired,
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
		isSiteEligible: PropTypes.bool.isRequired,
	};

	state = {
		renderChecklistCompleteBanner: null,
	};

	static getDerivedStateFromProps( nextProps, prevState ) {
		// If we still don't have checklist data or we don't want to render the banner, probably because
		// this is a page load, don't change the state.
		if (
			null === nextProps.isChecklistComplete ||
			'norender' === prevState.renderChecklistCompleteBanner
		) {
			return null;
		}
		// If this state prop doesn't have a value yet
		if ( null === prevState.renderChecklistCompleteBanner ) {
			return {
				// Set to norender because this is the initial state value and the checklist is completed.
				// Otherwise the banner will always display once the checklist is completed, even on page load.
				renderChecklistCompleteBanner: nextProps.isChecklistComplete ? 'norender' : 'waiting', // If checklist is not complete, let's flag it and wait until it is.
			};
		}
		// If we're here, this is not a page load, so let's check if the checklist was completed.
		if ( nextProps.isChecklistComplete ) {
			return {
				renderChecklistCompleteBanner: 'render',
			};
		}
		return null;
	}

	render() {
		const { translate, canUserUseCustomerHome } = this.props;

		if ( ! canUserUseCustomerHome ) {
			const title = this.props.isSiteEligible
				? translate( 'You are not authorized to view this page.' )
				: translate( 'This page is not available on this site.' );
			return (
				<EmptyContent
					title={ preventWidows( title ) }
					illustration="/calypso/images/illustrations/error.svg"
				/>
			);
		}

		const { siteId, hasChecklistData, isChecklistComplete, checklistMode } = this.props;
		const renderChecklistCompleteBanner = 'render' === this.state.renderChecklistCompleteBanner;

		return (
			<Main className="customer-home__main is-wide-layout">
				<PageViewTracker path={ `/home/:site` } title={ translate( 'Customer Home' ) } />
				<DocumentHead title={ translate( 'Customer Home' ) } />
				<SidebarNavigation />
				{ renderChecklistCompleteBanner && (
					<Banner
						dismissPreferenceName="checklist-complete"
						dismissTemporary={ true }
						icon="checkmark"
						disableHref
						title={ translate( 'Congratulations!' ) }
						description={ translate( "You've completed each item in your checklist." ) }
					/>
				) }
				{ siteId && ! hasChecklistData && <QuerySiteChecklist siteId={ siteId } /> }
				{ hasChecklistData &&
					( isChecklistComplete ? (
						this.renderCustomerHome()
					) : (
						<ChecklistWpcom displayMode={ checklistMode } />
					) ) }
			</Main>
		);
	}

	renderCustomerHome = () => {
		const { translate, customizeUrl, site, siteSlug } = this.props;
		return (
			<div className="customer-home__layout">
				<div className="customer-home__layout-col">
					<Card>
						<CardHeading>{ translate( 'My Site' ) }</CardHeading>
						<h6 className="customer-home__card-subheader">
							{ translate( 'Review and update my site' ) }
						</h6>
						<div className="customer-home__card-button-pair">
							<Button href={ site.URL } primary>
								{ translate( 'View Site' ) }
							</Button>
							<Button href={ customizeUrl }>{ translate( 'Edit Homepage' ) }</Button>
						</div>
					</Card>
					<Card className="customer-home__card-boxes">
						<div className="customer-home__boxes">
							<ActionBox
								onClick={ () => page( `/page/${ siteSlug }` ) }
								label={ translate( 'Add a page' ) }
								iconSrc="/calypso/images/customer-home/page.svg"
							/>
							<ActionBox
								onClick={ () => page( `/post/${ siteSlug }` ) }
								label={ translate( 'Write blog post' ) }
								iconSrc="/calypso/images/customer-home/post.svg"
							/>
							<ActionBox
								href={ customizeUrl }
								label={ translate( 'Customize theme' ) }
								iconSrc="/calypso/images/customer-home/customize.svg"
							/>
							<ActionBox
								onClick={ () => page( `/themes/${ siteSlug }` ) }
								label={ translate( 'Change theme' ) }
								iconSrc="/calypso/images/customer-home/theme.svg"
							/>
							<ActionBox
								href={ customizeUrl }
								label={ translate( 'Edit menus' ) }
								iconSrc="/calypso/images/customer-home/menus.svg"
							/>
							<ActionBox
								href="https://support.wordpress.com/images/"
								label={ translate( 'Change images' ) }
								iconSrc="/calypso/images/customer-home/images.svg"
							/>
							<ActionBox
								href="https://logojoy.grsm.io/looka"
								label={ translate( 'Design a logo' ) }
								iconSrc="/calypso/images/customer-home/logo.svg"
							/>
							<ActionBox
								onClick={ () => page( `/email/${ siteSlug }` ) }
								label={ translate( 'Add G Suite' ) }
								iconSrc="/calypso/images/customer-home/gsuite.svg"
							/>
						</div>
					</Card>
				</div>
				<div className="customer-home__layout-col">
					<Card>
						<CardHeading>{ translate( 'Grow & Earn' ) }</CardHeading>
						<h6 className="customer-home__card-subheader">
							{ translate( 'Grow my audience and earn money' ) }
						</h6>
						<VerticalNav className="customer-home__card-links">
							<VerticalNavItem path={ `/marketing/connections/${ siteSlug }` }>
								{ translate( 'Share my site' ) }
							</VerticalNavItem>
							<VerticalNavItem path={ `/marketing/tools/${ siteSlug }` }>
								{ translate( 'Grow my audience' ) }
							</VerticalNavItem>
							<VerticalNavItem path={ `/earn/${ siteSlug }` }>
								{ translate( 'Earn money' ) }
							</VerticalNavItem>
						</VerticalNav>
					</Card>
					<Card>
						<CardHeading>{ translate( 'Support' ) }</CardHeading>
						<h6 className="customer-home__card-subheader">
							{ translate( 'Get all of the help you need' ) }
						</h6>
						<div className="customer-home__card-support">
							<img
								src="/calypso/images/customer-home/happiness.png"
								alt={ translate( 'Support' ) }
							/>
							<VerticalNav className="customer-home__card-links">
								<VerticalNavItem path="https://en.support.wordpress.com/" external>
									{ translate( 'Support docs' ) }
								</VerticalNavItem>
								<VerticalNavItem path="/help/contact" external>
									{ translate( 'Contact us' ) }
								</VerticalNavItem>
							</VerticalNav>
						</div>
					</Card>
					<Card>
						<CardHeading>{ translate( 'Go Mobile' ) }</CardHeading>
						<h6 className="customer-home__card-subheader">
							{ translate( 'Make updates on the go' ) }
						</h6>
						<div className="customer-home__card-button-pair customer-home__card-mobile">
							<Button
								href="https://play.google.com/store/apps/details?id=org.wordpress.android"
								aria-label={ translate( 'Google Play' ) }
							>
								<img src="/calypso/images/customer-home/google-play.png" alt="" />
							</Button>
							<Button
								href="https://apps.apple.com/us/app/wordpress/id335703880"
								aria-label={ translate( 'App Store' ) }
							>
								<img src="/calypso/images/customer-home/apple-store.png" alt="" />
							</Button>
						</div>
					</Card>
				</div>
			</div>
		);
	};
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	const siteChecklist = getSiteChecklist( state, siteId );
	const hasChecklistData = null !== siteChecklist && Array.isArray( siteChecklist.tasks );
	const isChecklistComplete = isSiteChecklistComplete( state, siteId );

	return {
		site: getSelectedSite( state ),
		siteId,
		siteSlug: getSelectedSiteSlug( state ),
		customizeUrl: getCustomizerUrl( state, siteId ),
		canUserUseCustomerHome: canCurrentUserUseCustomerHome( state, siteId ),
		hasChecklistData,
		isChecklistComplete,
		isSiteEligible: isSiteEligibleForCustomerHome( state, siteId ),
	};
} )( localize( Home ) );
