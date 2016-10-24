/**
 * External dependencies
 */
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CardContent from './card/content';
import CardHeader from './card/header';
import DomainMainPlaceholder from 'my-sites/upgrades/domain-management/components/domain/main-placeholder';
import Header from 'my-sites/upgrades/domain-management/components/header';
import Main from 'components/main';
import paths from 'my-sites/upgrades/paths';
import { getSelectedDomain } from 'lib/domains';
import { type as domainTypes } from 'lib/domains/constants';

const PrivacyProtection = React.createClass( {
	propTypes: {
		domains: React.PropTypes.object.isRequired,
		products: React.PropTypes.object.isRequired,
		selectedDomainName: React.PropTypes.string.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired
	},

	componentWillMount() {
		this.ensurePageCanLoad();
	},

	componentWillUpdate() {
		this.ensurePageCanLoad();
	},

	ensurePageCanLoad() {
		const domain = getSelectedDomain( this.props );

		if ( ! domain ) {
			return;
		}

		if ( ! this.canAddPrivacyProtection() ) {
			page( paths.domainManagementContactsPrivacy( this.props.selectedSite.slug, this.props.selectedDomainName ) );
		}
	},

	canAddPrivacyProtection() {
		const domain = getSelectedDomain( this.props );

		return ( domain && domain.type === domainTypes.REGISTERED && ! domain.hasPrivacyProtection );
	},

	render: function() {
		if ( ! this.canAddPrivacyProtection() ) {
			return <DomainMainPlaceholder goBack={ this.goToPreviousSection } />;
		}

		return (
			<Main className="domain-management-privacy-protection">
				<Header
					onClick={ this.goToPreviousSection }
					selectedDomainName={ this.props.selectedDomainName }>
					{ this.translate( 'Privacy Protection' ) }
				</Header>

				<Card className="privacy-protection-card">
					<CardHeader
						selectedDomainName={ this.props.selectedDomainName }
						selectedSite={ this.props.selectedSite }
						products={ this.props.products } />

					<CardContent
						selectedDomainName={ this.props.selectedDomainName }
						selectedSite={ this.props.selectedSite } />
				</Card>
			</Main>
		);
	},

	goToPreviousSection() {
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
} );

export default PrivacyProtection;
