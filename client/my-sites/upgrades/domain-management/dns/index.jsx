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
import DomainMainPlaceholder from 'my-sites/upgrades/domain-management/components/domain/main-placeholder';
import Header from 'my-sites/upgrades/domain-management/components/header';
import Main from 'components/main';
import paths from 'my-sites/upgrades/paths';
import { getSelectedDomain, isRegisteredDomain } from 'lib/domains';
import Card from 'components/card/compact';
import SectionHeader from 'components/section-header';

const Dns = React.createClass( {
	propTypes: {
		domains: React.PropTypes.object.isRequired,
		dns: React.PropTypes.object.isRequired,
		selectedDomainName: React.PropTypes.string.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired
	},

	render() {
		if ( ! this.props.dns.hasLoadedFromServer ) {
			return <DomainMainPlaceholder goBack={ this.goBack } />;
		}

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
