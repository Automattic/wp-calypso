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

class CustomerHome extends Component {
	static propTypes = {
		site: PropTypes.object.isRequired,
		siteId: PropTypes.number.isRequired,
		siteSlug: PropTypes.string.isRequired,
		customizeUrl: PropTypes.string.isRequired,
	};

	render() {
		const { translate, site, customizeUrl } = this.props;

		return (
			<Main className="customer-home__main is-wide-layout">
				<PageViewTracker path={ `/customer-home/:site` } title={ translate( 'Customer Home' ) } />
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
							<ul className="customer-home__card-boxes">
								<li>{ translate( 'Add a page' ) }</li>
								<li>{ translate( 'Write blog post' ) }</li>
								<li>{ translate( 'Customize theme' ) }</li>
								<li>{ translate( 'Change theme' ) }</li>
								<li>{ translate( 'Edit menus' ) }</li>
								<li>{ translate( 'Change images' ) }</li>
								<li>{ translate( 'Design a logo' ) }</li>
								<li>{ translate( 'Add G Suite' ) }</li>
							</ul>
						</Card>
					</div>
					<div className="customer-home__layout-col">
						<Card>
							<CardHeading>{ translate( 'Grow & Earn' ) }</CardHeading>
							<h6 className="customer-home__card-subheader">
								{ translate( 'Grow my audience and earn money' ) }
							</h6>
							<ul className="customer-home__card-links">
								<li>{ translate( 'Share my site' ) }</li>
								<li>{ translate( 'Grow my audience' ) }</li>
								<li>{ translate( 'Earn money' ) }</li>
							</ul>
						</Card>
						<Card>
							<CardHeading>{ translate( 'Support' ) }</CardHeading>
							<h6 className="customer-home__card-subheader">
								{ translate( 'Get all of the help you need' ) }
							</h6>
							<ul className="customer-home__card-links">
								<li>{ translate( 'Support docs' ) }</li>
								<li>{ translate( 'Contact us' ) }</li>
							</ul>
						</Card>
						<Card>
							<CardHeading>{ translate( 'Go Mobile' ) }</CardHeading>
							<h6 className="customer-home__card-subheader">
								{ translate( 'Make updates on the go' ) }
							</h6>
							<div className="customer-home__card-button-pair">
								<Button href="https://play.google.com/store/apps/details?id=org.wordpress.android">
									{ translate( 'Google Play' ) }
								</Button>
								<Button href="https://apps.apple.com/us/app/wordpress/id335703880">
									{ translate( 'Apple App Store' ) }
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
} )( localize( CustomerHome ) );
