/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import DnsAddNew from './dns-add-new';
import DnsDetails from './dns-details';
import DnsList from './dns-list';
import DomainMainPlaceholder from 'my-sites/domains/domain-management/components/domain/main-placeholder';
import Header from 'my-sites/domains/domain-management/components/header';
import Main from 'components/main';
import paths from 'my-sites/domains/paths';
import { getSelectedDomain, isRegisteredDomain } from 'lib/domains';
import Card from 'components/card/compact';
import SectionHeader from 'components/section-header';
import DnsTemplates from '../name-servers/dns-templates';
import VerticalNav from 'components/vertical-nav';

const Dns = React.createClass( {
	propTypes: {
		domains: React.PropTypes.object.isRequired,
		dns: React.PropTypes.object.isRequired,
		// isMappedDomain: React.PropTypes.bool.isRequired,
		selectedDomainName: React.PropTypes.string.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired
	},

	getInitialState() {
		return { addNew: true };
	},

	renderDnsTemplates() {
console.log( this.props.selectedSite.options.is_mapped_domain );
console.log( '^^^^^^^' );
		if ( ! this.props.selectedSite.options.is_mapped_domain ) {
			return null;
		}

		return (
			<VerticalNav>
				<DnsTemplates selectedDomainName={ this.props.selectedDomainName } />
			</VerticalNav>
		);
	},

	render() {
		if ( ! this.props.dns.hasLoadedFromServer ) {
			return <DomainMainPlaceholder goBack={ this.goBack } />;
		}

console.log( this.props );

		return (
			<Main className="dns">
				<Header
					onClick={ this.goBack }
					selectedDomainName={ this.props.selectedDomainName }>
					{ this.translate( 'DNS Records' ) }
				</Header>

				<SectionHeader label={ this.translate( 'DNS Records' ) } />
				<Card>
					<DnsDetails />

					<DnsList
						dns={ this.props.dns }
						selectedSite={ this.props.selectedSite }
						selectedDomainName={ this.props.selectedDomainName } />

					<DnsAddNew
						isSubmittingForm={ this.props.dns.isSubmittingForm }
						selectedDomainName={ this.props.selectedDomainName } />
				</Card>
				{ this.renderDnsTemplates() }
			</Main>
		);
	},

	goBack() {
		let path;

		if ( isRegisteredDomain( getSelectedDomain( this.props ) ) ) {
			path = paths.domainManagementNameServers;
		} else {
			path = paths.domainManagementEdit;
		}

		page( path(
			this.props.selectedSite.slug,
			this.props.selectedDomainName
		) );
	}
} );

export default Dns;
