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
import Button from 'components/button';
import Card from 'components/card';
import CardHeading from 'components/card-heading';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { getCustomizerUrl } from 'state/sites/selectors';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import DocumentHead from 'components/data/document-head';

/**
 * Style dependencies
 */
import './style.scss';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';

const ActionBox = ( { action, iconSrc, label } ) => {
	const buttonAction = 'function' === typeof action ? { onClick: action } : { href: action };
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
		site: PropTypes.object.isRequired,
		siteId: PropTypes.number.isRequired,
		siteSlug: PropTypes.string.isRequired,
		customizeUrl: PropTypes.string.isRequired,
	};

	render() {
		const { translate, customizeUrl, site, siteSlug } = this.props;

		return (
			<Main className="customer-home__main is-wide-layout">
				<PageViewTracker path={ `/home/:site` } title={ translate( 'Customer Home' ) } />
				<DocumentHead title={ translate( 'Customer Home' ) } />
				<SidebarNavigation />
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
									action={ () => page( `/page/${ siteSlug }` ) }
									label={ translate( 'Add a page' ) }
									iconSrc="/calypso/images/customer-home/page.svg"
								/>
								<ActionBox
									action={ () => page( `/post/${ siteSlug }` ) }
									label={ translate( 'Write blog post' ) }
									iconSrc="/calypso/images/customer-home/post.svg"
								/>
								<ActionBox
									action={ customizeUrl }
									label={ translate( 'Customize theme' ) }
									iconSrc="/calypso/images/customer-home/customize.svg"
								/>
								<ActionBox
									action={ () => page( `/themes/${ siteSlug }` ) }
									label={ translate( 'Change theme' ) }
									iconSrc="/calypso/images/customer-home/theme.svg"
								/>
								<ActionBox
									action={ customizeUrl }
									label={ translate( 'Edit menus' ) }
									iconSrc="/calypso/images/customer-home/menus.svg"
								/>
								<ActionBox
									action="https://en.support.wordpress.com/images/"
									label={ translate( 'Change images' ) }
									iconSrc="/calypso/images/customer-home/images.svg"
								/>
								<ActionBox
									action="https://logojoy.grsm.io/looka"
									label={ translate( 'Design a logo' ) }
									iconSrc="/calypso/images/customer-home/logo.svg"
								/>
								<ActionBox
									action="https://wordpress.com/email/domain.wordpress.com"
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
									<VerticalNavItem path="https://wordpress.com/help/contact" external>
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
			</Main>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	return {
		site: getSelectedSite( state ),
		siteId,
		siteSlug: getSelectedSiteSlug( state ),
		customizeUrl: getCustomizerUrl( state, siteId ),
	};
} )( localize( Home ) );
