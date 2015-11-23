/**
 * External dependencies
 */
import page from 'page';
import React from 'react';
import times from 'lodash/utility/times';

/**
 * Internal dependencies
 */
import analyticsMixin from 'lib/mixins/analytics';
import DomainWarnings from 'my-sites/upgrades/components/domain-warnings';
import ListItem from './item';
import ListItemPlaceholder from './item-placeholder';
import Main from 'components/main';
import paths from 'my-sites/upgrades/paths';
import SectionHeader from 'components/section-header';
import Button from 'components/button';
import UpgradesNavigation from 'my-sites/upgrades/navigation';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import EmptyContent from 'components/empty-content';
import config from 'config';

const List = React.createClass( {
	mixins: [ analyticsMixin( 'domainManagement', 'list' ) ],

	domainWarnings() {
		if ( this.props.domains.hasLoadedFromServer ) {
			return <DomainWarnings
				domains={ this.props.domains.list }
				selectedSite={ this.props.selectedSite }
				ruleWhiteList={ [ 'newDomainsWithPrimary', 'newDomains' ] } />;
		}
	},

	renderUpgradePrompt() {
		return (
			<Main>
				<EmptyContent
					illustration="/calypso/images/drake/drake-whoops.svg"
					title={ this.translate( 'Want to use custom domains on your site?', { context: 'site setting upgrade' } ) }
					line={ this.translate( 'Custom domains are available with WordPress.com.', { context: 'site setting upgrade' } ) }
					/>
			</Main>
		);
	},

	render() {
		var headerText = this.translate( 'Domains', { context: 'A navigation label.' } );

		if ( ! this.props.domains ) {
			return null;
		}

		if ( ! config.isEnabled( 'premium-plans' ) ) {
			return this.renderUpgradePrompt();
		}

		return (
			<Main className="domain-management-list">
				<SidebarNavigation />
				<UpgradesNavigation
					path={ this.props.context.path }
					cart={ this.props.cart }
					selectedSite={ this.props.selectedSite } />

				{ this.domainWarnings() }

				<SectionHeader label={ headerText }>
					{ this.addDomainButton() }
				</SectionHeader>

				<div className="domain-management-list__items">
					{ this.listItems() }
				</div>
			</Main>
		);
	},

	clickAddDomain() {
		this.recordEvent( 'addDomainClick' );

		page( '/domains/add/' + this.props.selectedSite.slug );
	},

	addDomainButton() {
		return (
			<Button
				primary
				compact
				className="domain-management-list__add-a-domain"
				onClick={ this.clickAddDomain }>
				{ this.translate( 'Add Domain' ) }
			</Button>
		);
	},

	listItems() {
		if ( ! this.props.domains.hasLoadedFromServer ) {
			return times( 3, n => <ListItemPlaceholder key={ `item-${ n }` } /> );
		}

		return this.props.domains.list.map( ( domain ) => {
			return (
				<ListItem key={ domain.name }
					domain={ domain }
					onClick={ this.goToEditDomainRoot.bind( this, domain ) } />
			);
		} );
	},

	goToEditDomainRoot( domain ) {
		page( paths.domainManagementEdit( this.props.selectedSite.domain, domain.name ) );
	}
} );

export default List;
