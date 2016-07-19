/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import Header from 'my-sites/upgrades/domain-management/components/header';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import AddGoogleAppsCard from './add-google-apps-card';
import GoogleAppsUsersCard from './google-apps-users-card';
import Placeholder from './placeholder';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';
import UpgradesNavigation from 'my-sites/upgrades/navigation';
import EmptyContent from 'components/empty-content';
import paths from 'my-sites/upgrades/paths';
import {
	hasGoogleApps,
	hasGoogleAppsSupportedDomain,
	getSelectedDomain,
	hasMappedDomain
} from 'lib/domains';
import { isPlanFeaturesEnabled } from 'lib/plans';

const Email = React.createClass( {
	propTypes: {
		domains: React.PropTypes.object.isRequired,
		products: React.PropTypes.object.isRequired,
		selectedDomainName: React.PropTypes.string,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired,
		sitePlans: React.PropTypes.object.isRequired,
		user: React.PropTypes.object.isRequired,
		googleAppsUsers: React.PropTypes.array.isRequired,
		googleAppsUsersLoaded: React.PropTypes.bool.isRequired
	},

	render() {
		return (
			<Main
				className="domain-management-email"
				wideLayout={ isPlanFeaturesEnabled() }
			>
				<SidebarNavigation />
				{ this.headerOrUpgradesNavigation() }
				{ this.content() }
			</Main>
		);
	},

	headerOrUpgradesNavigation() {
		if ( this.props.selectedDomainName ) {
			return (
				<Header
					onClick={ this.goToEditOrList }
					selectedDomainName={ this.props.selectedDomainName }>
					{ this.translate( 'Email' ) }
				</Header>
			);
		}
		return (
			<UpgradesNavigation
				path={ this.props.context.path }
				cart={ this.props.cart }
				selectedSite={ this.props.selectedSite }
				sitePlans={ this.props.sitePlans } />
		);
	},

	content() {
		if ( ! ( this.props.domains.hasLoadedFromServer && this.props.googleAppsUsersLoaded ) ) {
			return <Placeholder />;
		}

		const domainList = this.props.selectedDomainName
			? [ getSelectedDomain( this.props ) ]
			: this.props.domains.list;

		if ( domainList.some( hasGoogleApps ) ) {
			return this.googleAppsUsersCard();
		} else if ( hasGoogleAppsSupportedDomain( domainList ) ) {
			return this.addGoogleAppsCard();
		}
		return this.emptyContent();
	},

	emptyContent() {
		const {
			selectedSite,
			selectedDomainName,
			domains
			} = this.props;
		let emptyContentProps;

		if ( selectedDomainName ) {
			emptyContentProps = {
				title: this.translate( 'Google Apps is not supported on this domain' ),
				line: this.translate( 'Only domains registered with WordPress.com are eligible for Google Apps.' ),
				secondaryAction: this.translate( 'Add Email Forwarding' ),
				secondaryActionURL: paths.domainManagementEmailForwarding( selectedSite.slug, selectedDomainName )
			};
		} else if ( hasMappedDomain( domains.list ) ) {
			emptyContentProps = {
				title: this.translate( 'Google Apps is not supported on mapped domains' ),
				line: this.translate( 'Only domains registered with WordPress.com are eligible for Google Apps.' )
			};
		} else {
			emptyContentProps = {
				title: this.translate( "You don't have any domains yet." ),
				line: this.translate(
					'Add a domain to your site to make it easier ' +
					'to remember and easier to share, and get access to email ' +
					'forwarding, Google Apps for Work, and other email services.'
				)
			};
		}
		Object.assign( emptyContentProps, {
			illustration: '/calypso/images/drake/drake-whoops.svg',
			action: this.translate( 'Add a Custom Domain' ),
			actionURL: '/domains/add/' + this.props.selectedSite.slug
		} );

		return (
			<EmptyContent { ...emptyContentProps } />
		);
	},

	googleAppsUsersCard() {
		return <GoogleAppsUsersCard { ...this.props } />;
	},

	addGoogleAppsCard() {
		return (
			<div>
				<AddGoogleAppsCard { ...this.props } />
				{ this.props.selectedDomainName && <VerticalNav>
					<VerticalNavItem
						path={ paths.domainManagementEmailForwarding( this.props.selectedSite.slug, this.props.selectedDomainName ) }>
						{ this.translate( 'Email Forwarding' ) }
					</VerticalNavItem>
				</VerticalNav> }
			</div>
		);
	},

	goToEditOrList() {
		if ( this.props.selectedDomainName ) {
			page( paths.domainManagementEdit( this.props.selectedSite.slug, this.props.selectedDomainName ) );
		} else {
			page( paths.domainManagementList( this.props.selectedSite.slug ) );
		}
	}
} );

module.exports = Email;
