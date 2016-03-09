/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import i18n from 'lib/mixins/i18n';
import PrivacyProtectionDialog from './privacy-protection-dialog';

const PrivacyProtectionCheckbox = ( { onCheckboxChange, isChecked } ) => (
	<div>
		<Card className="checkout__privacy-protection-checkbox">
			<input type="checkbox" onChange={ this.props.onCheckboxChange } checked={ this.props.isChecked } />
			<div className="privacy-protection-checkbox__description">
				<strong className="checkout__privacy-protection-checkbox-heading">{ this.translate( 'Please keep my information private.', { textOnly: true } ) }</strong>
				<p className="checkout__privacy-protection-checkbox-text">{ priceForPrivacyText }</p>
				<a href="" onClick={ this.handleDialogOpen }>Learn more about Privacy Protection.</a>
			</div>
			<div>
				<Gridicon icon="lock" size={ 48 } />
			</div>
		</Card>
		<PrivacyProtectionDialog
			disabled={ this.props.disabled }
			domain={ this.getFirstDomainToRegister() }
			cost={ this.getPrivacyProtectionCost() }
			countriesList={ this.props.countriesList }
			fields={ this.props.fields }
			isVisible={ this.props.isDialogVisible }
			onSelect={ this.handleDialogSelect }
			onClose={ this.handleDialogClose } />
	</div>
);

export defualt PrivacyProtectionCheckbox;
