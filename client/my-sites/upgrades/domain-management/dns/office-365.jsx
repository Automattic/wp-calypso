/**
 * External dependencies
 */
import isEmpty from 'lodash/isEmpty';
import React, { Component } from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormFooter from 'my-sites/upgrades/domain-management/components/form-footer';
import FormInputValidation from 'components/forms/form-input-validation';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import notices from 'notices';
import * as upgradesActions from 'lib/upgrades/actions';

class Office365 extends Component {
	constructor( props ) {
		super( props );
		this.state = { show: false, token: '' };
	}

	onAddOffice365 = ( event ) => {
		event.preventDefault();
		this.setState( { show: true } );
	}

	onChange = ( event ) => {
		const { value } = event.target;
		this.setState( { show: true, token: value } );
	}

	onAddDnsRecords = ( event ) => {
		event.preventDefault();
		upgradesActions.addDnsOffice( this.props.selectedDomainName, this.state.token, ( error ) => {
			if ( error ) {
				notices.error( error.message || this.props.translate( 'The DNS record has not been added.' ) );
			} else {
				notices.success( this.props.translate( 'The DNS record has been added.' ), {
					duration: 5000
				} );
				this.setState( { show: true } );
			}
		} );
	}

	render() {
		const classes = classnames( 'form-content', { 'is-hidden': ! this.state.show } );
		const isDataValid = this.state.token.match( /^MS=ms\d+$/ );

		return (
			<form className="dns__office365">
				<a onClick={ this.onAddOffice365 }>{ this.props.translate( 'Looking for Office 365 setup? Continue from here.' ) }</a>
				<div className={ classes }>
					<FormFieldset>
						<FormLabel>{ this.props.translate( 'Office 365 Verification Token' ) }</FormLabel>
						<FormTextInput
							name="token"
							isError={ ! isEmpty( this.state.token ) && ! isDataValid }
							onChange={ this.onChange }
							placeholder="MS=ms..." />
						{ this.state.token && ! isDataValid
							? <FormInputValidation text={ this.props.translate( 'Invalid Token' ) } isError={ true } /> : null }
					</FormFieldset>

					<FormFooter>
						<FormButton
							disabled={ ! isDataValid }
							onClick={ this.onAddDnsRecords }>
							{ this.props.translate( 'Add New DNS Records' ) }
						</FormButton>
					</FormFooter>
				</div>
			</form>
		);
	}
}

export default localize( Office365 );
