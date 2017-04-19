/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import DnsAddNew from './dns-add-new';
import DnsDetails from './dns-details';
import DnsList from './dns-list';
import DomainMainPlaceholder from 'my-sites/upgrades/domain-management/components/domain/main-placeholder';
import Gridicon from 'gridicons';
import Header from 'my-sites/upgrades/domain-management/components/header';
import Main from 'components/main';
import Office365 from './office-365';
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

	getInitialState() {
		return { addNew: true };
	},

	hasOffice() {
		const { dns } = this.props;
		if ( ! dns || ! dns.records ) {
			return false;
		}

		return dns.records.some( ( record ) => {
			return 'autodiscover.outlook.com.' === record.data;
		} );
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

					{ this.state.addNew || this.hasOffice()
						? <DnsAddNew
							isSubmittingForm={ this.props.dns.isSubmittingForm }
							selectedDomainName={ this.props.selectedDomainName } />
						: <Office365
							isSubmittingForm={ this.props.dns.isSubmittingForm }
							selectedDomainName={ this.props.selectedDomainName } />
					}

					{ ! this.hasOffice() && <Button borderless onClick={ this.office365Toggle }>
						<Gridicon icon="mail" />{ ' ' }
						{ this.state.addNew

							? this.translate( 'Looking for Office 365 setup? Continue from here.' )
							: this.translate( 'Add new DNS records' ) }</Button>
					}
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
	},

	office365Toggle( event ) {
		event.preventDefault();
		this.setState( { addNew: ! this.state.addNew } );
	}
} );

export default Dns;
