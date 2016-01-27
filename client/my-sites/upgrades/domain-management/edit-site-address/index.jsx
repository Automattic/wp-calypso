/**
 * External Dependencies
 **/
import React from 'react';
import page from 'page';

/**
 * Internal Dependencies
 **/
import DomainMainPlaceholder from 'my-sites/upgrades/domain-management/components/domain/main-placeholder';
import Header from 'my-sites/upgrades/domain-management/components/header';
import Main from 'components/main';
import { getSelectedDomain } from 'lib/domains';
import paths from 'my-sites/upgrades/paths';

import FormFieldset from 'components/forms/form-fieldset';
import FormButton from 'components/forms/form-button';
import FormLabel from 'components/forms/form-label';
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';

import Card from 'components/card/compact';
import SectionHeader from 'components/section-header';

const EditSiteAddress = React.createClass( {
	getInitialState() {
		return {
			newAddress: '',
			newAddressRepeat: ''
		};
	},

	onFieldChange( event ) {
		event.preventDefault();
		let name = event.target.getAttribute( 'name' );
		this.setState( { [ name ]: event.target.value } );
	},

	render() {
		const domain = getSelectedDomain( this.props );

		if ( ! domain ) {
			return <DomainMainPlaceholder goBack={ this.goToDomainManagement }/>;
		}

		return (
			<Main>
				<Header onClick={ this.goToDomainManagement } selectedDomainName={ this.props.selectedDomainName }>
					{ this.translate( 'Edit Site Address' ) }
				</Header>
				<SectionHeader label={ this.translate( 'Edit Site Address' ) }/>
				<Card>
					<FormFieldset>
						<FormLabel htmlFor="new-address">{ this.translate( 'New Address' ) }</FormLabel>
						<FormTextInputWithAffixes
							suffix="wordpress.com"
							id="new-address"
							name="newAddress"
							type="text"
							onChange={ this.onFieldChange }/>
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="new-address-repeat">{ this.translate( 'Confirm New Address' ) }</FormLabel>
						<FormTextInputWithAffixes
							suffix="wordpress.com"
							id="new-address-repeat"
							name="newAddressRepeat"
							type="text"
							onChange={ this.onFieldChange }
							disabled={ ! this.state.newAddress } />
					</FormFieldset>

					<FormButton
						disabled={ ! this.state.newAddress || this.state.newAddress !== this.state.newAddressRepeat } />
				</Card>
			</Main>
		);
	},

	goToDomainManagement() {
		page( paths.domainManagementList( this.props.selectedSite.domain ) );
	}
} );

export default EditSiteAddress;
