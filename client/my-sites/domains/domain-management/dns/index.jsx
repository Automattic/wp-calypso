/** @format */
/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import { localize } from 'i18n-calypso';

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
import { getSelectedDomain, isMappedDomain, isRegisteredDomain } from 'lib/domains';
import Card from 'components/card/compact';
import SectionHeader from 'components/section-header';
import DnsTemplates from '../name-servers/dns-templates';
import VerticalNav from 'components/vertical-nav';

class Dns extends React.Component {
	static propTypes = {
		domains: React.PropTypes.object.isRequired,
		dns: React.PropTypes.object.isRequired,
		selectedDomainName: React.PropTypes.string.isRequired,
		selectedSite: React.PropTypes.oneOfType( [ React.PropTypes.object, React.PropTypes.bool ] )
			.isRequired,
	};

	state = {
		addNew: true,
	};

	renderDnsTemplates() {
		const selectedDomain = getSelectedDomain( this.props );

		if ( ! selectedDomain || ! isMappedDomain( selectedDomain ) ) {
			return null;
		}

		return (
			<VerticalNav>
				<DnsTemplates selectedDomainName={ this.props.selectedDomainName } />
			</VerticalNav>
		);
	}

	render() {
		const { dns, selectedDomainName, selectedSite, translate } = this.props;

		if ( ! dns.hasLoadedFromServer ) {
			return <DomainMainPlaceholder goBack={ this.goBack } />;
		}

		return (
			<Main className="dns">
				<Header onClick={ this.goBack } selectedDomainName={ selectedDomainName }>
					{ translate( 'DNS Records' ) }
				</Header>

				<SectionHeader label={ translate( 'DNS Records' ) } />
				<Card>
					<DnsDetails />

					<DnsList
						dns={ dns }
						selectedSite={ selectedSite }
						selectedDomainName={ selectedDomainName }
					/>

					<DnsAddNew
						isSubmittingForm={ dns.isSubmittingForm }
						selectedDomainName={ selectedDomainName }
					/>
				</Card>
				{ this.renderDnsTemplates() }
			</Main>
		);
	}

	goBack = () => {
		let path;

		if ( isRegisteredDomain( getSelectedDomain( this.props ) ) ) {
			path = paths.domainManagementNameServers;
		} else {
			path = paths.domainManagementEdit;
		}

		page( path( this.props.selectedSite.slug, this.props.selectedDomainName ) );
	};
}

export default localize( Dns );
