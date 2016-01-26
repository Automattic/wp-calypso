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
import FormInputValidation from 'components/forms/form-input-validation';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';

import Card from 'components/card/compact';
import SectionHeader from 'components/section-header';

const EditSiteAddress = React.createClass( {
	onFieldChange( event ) {

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
						<FormTextInputWithAffixes suffix="wordpress.com" id="new-address" name="new-address" type="text" onChange={ this.onFieldChange }/>
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="new-address-repeat">{ this.translate( 'New Address Again' ) }</FormLabel>
						<FormTextInputWithAffixes suffix="wordpress.com" id="new-address-repeat" name="new-address-repeat" type="text" onChange={ this.onFieldChange }/>
					</FormFieldset>
				</Card>
			</Main>
		);
	},

	goToDomainManagement() {
		page( paths.domainManagementList( this.props.selectedSite.domain ) );
	}
} );

export default EditSiteAddress;
