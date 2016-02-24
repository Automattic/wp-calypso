/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import map from 'lodash/map';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import Header from 'my-sites/upgrades/domain-management/components/header';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import AddGoogleAppsCard from './add-google-apps-card';
import GoogleAppsUsersCard from './google-apps-users-card';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';
import UpgradesNavigation from 'my-sites/upgrades/navigation';
import EmptyContent from 'components/empty-content';
import paths from 'my-sites/upgrades/paths';
import { hasGoogleApps, canAddEmail, getSelectedDomain } from 'lib/domains';

const Email = React.createClass( {
	propTypes: {
		domains: React.PropTypes.object.isRequired,
		products: React.PropTypes.object.isRequired,
		selectedDomainName: React.PropTypes.string,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired,
		user: React.PropTypes.object.isRequired,
		users: React.PropTypes.array.isRequired,
		loaded: React.PropTypes.bool.isRequired
	},

	render() {
		return (
			<Main className="domain-management-email">
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
				selectedSite={ this.props.selectedSite }/>
		);
	},

	content() {
		if ( ! this.props.domains.hasLoadedFromServer ) {
			return this.translate( 'Loading…' );
		}
		let domainList = this.props.selectedDomainName
			? [ getSelectedDomain( this.props ) ]
			: this.props.domains.list;

		if ( domainList.some( hasGoogleApps ) ) {
			return this.googleAppsUsersCard();
		} else if ( canAddEmail( domainList ) ) {
			return this.addGoogleAppsCard();
		}
		return this.emptyContent();
	},

	emptyContent() {
		let props = {
			title: this.translate( "You don't have any domains yet." ),
			line: this.translate(
				'Add a domain to your site to make it easier ' +
				'to remember and easier to share, and get access to email ' +
				'forwarding, Google Apps for Work, and other email services.'
			),
			illustration: '/calypso/images/drake/drake-whoops.svg',
			action: this.translate( 'Add a Custom Domain' ),
			actionURL: '/domains/add/' + this.props.selectedSite.domain
		};

		return (
			<EmptyContent { ...props } />
		);
	},

	googleAppsUsersCard() {
		return <GoogleAppsUsersCard { ...this.props } />;
	},

	addGoogleAppsCard() {
		return (
			<div>
				<AddGoogleAppsCard { ...this.props } />
				<VerticalNav>
					<VerticalNavItem
						path={ paths.domainManagementEmailForwarding( this.props.selectedSite.domain, this.props.selectedDomainName ) }>
						{ this.translate( 'Email Forwarding' ) }
					</VerticalNavItem>
				</VerticalNav>
			</div>
		);
	},

	goToEditOrList() {
		if ( this.props.selectedDomainName ) {
			page( paths.domainManagementEdit( this.props.selectedSite.domain, this.props.selectedDomainName ) );
		} else {
			page( paths.domainManagementList( this.props.selectedSite.domain ) );
		}
	}
} );

module.exports = Email;
