/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import { localize } from 'i18n-calypso';

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
	getSelectedDomain
} from 'lib/domains';
import { isPlanFeaturesEnabled } from 'lib/plans';
import { hasCustomDomain } from 'lib/site/utils';

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
					{ this.props.translate( 'Email' ) }
				</Header>
			);
		}
		return (
			<UpgradesNavigation
				path={ this.props.context.path }
				cart={ this.props.cart }
				selectedSite={ this.props.selectedSite } />
		);
	},

	content() {
		if ( ! ( this.props.domains.hasLoadedFromServer && this.props.googleAppsUsersLoaded && this.props.products.gapps ) ) {
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
			translate
			} = this.props;
		let emptyContentProps;

		if ( selectedDomainName ) {
			emptyContentProps = {
				title: translate( 'G Suite is not supported on this domain' ),
				line: translate( 'Only domains registered with WordPress.com are eligible for G Suite.' ),
				secondaryAction: translate( 'Add Email Forwarding' ),
				secondaryActionURL: paths.domainManagementEmailForwarding( selectedSite.slug, selectedDomainName )
			};
		} else {
			emptyContentProps = {
				title: translate( 'Enable powerful email features.' ),
				line: translate(
					'To set up email forwarding, G Suite, and other email ' +
					'services for your site, upgrade your site’s web address ' +
					'to a professional custom domain.'
				)
			};
		}
		Object.assign( emptyContentProps, {
			illustration: '/calypso/images/drake/drake-whoops.svg',
			action: translate( 'Add a Custom Domain' ),
			actionURL: '/domains/add/' + this.props.selectedSite.slug
		} );

		return (
			<EmptyContent { ...emptyContentProps } />
		);
	},

	googleAppsUsersCard() {
		return <GoogleAppsUsersCard { ...this.props } />;
	},

	renderEmailForwarding() {
		let domain;

		if ( this.props.selectedDomainName ) {
			domain = this.props.selectedDomainName;
		} else if ( hasCustomDomain( this.props.selectedSite ) ) {
			domain = this.props.selectedSite.domain;
		}

		return (
			domain && <VerticalNav>
				<VerticalNavItem
					path={ paths.domainManagementEmailForwarding( this.props.selectedSite.slug, domain ) }>
					{ this.props.translate( 'Email Forwarding' ) }
				</VerticalNavItem>
			</VerticalNav>
		);
	},

	addGoogleAppsCard() {
		return (
			<div>
				<AddGoogleAppsCard { ...this.props } />
				{ this.renderEmailForwarding() }
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

export default localize( Email );
