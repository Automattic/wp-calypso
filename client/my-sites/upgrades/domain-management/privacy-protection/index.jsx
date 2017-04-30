/**
 * External dependencies
 */
import page from 'page';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CardContent from './card/content';
import PrivacyProtectionCardHeader from './privacy-protection-card/header';
import DomainMainPlaceholder from 'my-sites/upgrades/domain-management/components/domain/main-placeholder';
import Header from 'my-sites/upgrades/domain-management/components/header';
import { getProductDisplayCost } from 'state/products-list/selectors';
import { getSelectedDomain } from 'lib/domains';
import Main from 'components/main';
import paths from 'my-sites/upgrades/paths';
import QueryProductsList from 'components/data/query-products-list';
import { type as domainTypes } from 'lib/domains/constants';

class PrivacyProtection extends Component {
	static propTypes = {
		domains: PropTypes.object.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [
			PropTypes.object,
			PropTypes.bool
		] ).isRequired,
		translate: PropTypes.func.isRequired,
	};

	componentWillMount() {
		this.ensurePageCanLoad();
	}

	componentWillUpdate() {
		this.ensurePageCanLoad();
	}

	ensurePageCanLoad() {
		const domain = getSelectedDomain( this.props );

		if ( ! domain ) {
			return;
		}

		if ( ! this.canAddPrivacyProtection() ) {
			page( paths.domainManagementContactsPrivacy( this.props.selectedSite.slug, this.props.selectedDomainName ) );
		}
	}

	canAddPrivacyProtection() {
		const domain = getSelectedDomain( this.props );

		return ( domain && domain.type === domainTypes.REGISTERED && ! domain.hasPrivacyProtection );
	}

	render() {
		if ( ! this.canAddPrivacyProtection() ) {
			return <DomainMainPlaceholder goBack={ this.goToPreviousSection } />;
		}

		return (
			<Main className="domain-management-privacy-protection">
				<QueryProductsList />

				<Header
					onClick={ this.goToPreviousSection }
					selectedDomainName={ this.props.selectedDomainName }>
					{ this.props.translate( 'Privacy Protection' ) }
				</Header>

				<Card className="privacy-protection-card">
					{ this.props.displayCost && <PrivacyProtectionCardHeader
						displayCost={ this.props.displayCost }
						selectedDomainName={ this.props.selectedDomainName }
						selectedSite={ this.props.selectedSite } /> }

					<CardContent
						selectedDomainName={ this.props.selectedDomainName }
						selectedSite={ this.props.selectedSite } />
				</Card>
			</Main>
		);
	}

	goToPreviousSection = () => {
		const { prevPath } = this.props.context,
			previousSection = paths.getSectionName( prevPath );
		let path;

		if ( previousSection === 'contacts-privacy' ) {
			path = paths.domainManagementContactsPrivacy;
		} else {
			path = paths.domainManagementEdit;
		}

		page( path(
			this.props.selectedSite.slug,
			this.props.selectedDomainName
		) );
	}
}

export default connect(
	state => ( {
		displayCost: getProductDisplayCost( state, 'private_whois' ),
	} )
)( localize( PrivacyProtection ) );
