/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import includes from 'lodash/includes';
import assign from 'lodash/assign';
import find from 'lodash/find';

/**
 * Internal dependencies
 */
import ARecord from './a-record';
import CnameRecord from './cname-record';
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormFooter from 'my-sites/upgrades/domain-management/components/form-footer';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import MxRecord from './mx-record';
import TxtRecord from './txt-record';
import SrvRecord from './srv-record';
import formState from 'lib/form-state';
import notices from 'notices';
import * as upgradesActions from 'lib/upgrades/actions';
import { validateAllFields, getNormalizedData } from 'lib/domains/dns';

const DnsAddNew = React.createClass( {
	propTypes: {
		isSubmittingForm: React.PropTypes.bool.isRequired,
		selectedDomainName: React.PropTypes.string.isRequired
	},

	getInitialState() {
		return {
			show: false,
			fields: null,
			type: 'A'
		};
	},

	recordTypes: [
		[ ARecord, [ 'A', 'AAAA' ] ],
		[ CnameRecord, [ 'CNAME' ] ],
		[ MxRecord, [ 'MX' ] ],
		[ TxtRecord, [ 'TXT' ] ],
		[ SrvRecord, [ 'SRV' ] ]
	],

	getFieldsForType( type ) {
		/* eslint-disable no-unused-vars, no-shadow */
		// _ is not used anywhere, it is only a positional arg to have more readable code
		const [ Component, _ ] = find( this.recordTypes, ( [ _, types ] ) => {
		/* eslint-enable no-unused-vars, no-shadow */
			return includes( types, type );
		} );

		return assign( {}, Component.initialFields, { type } );
	},

	componentWillMount() {
		this.formStateController = formState.Controller( {
			initialFields: this.getFieldsForType( this.state.type ),
			onNewState: this.setFormState,
			validatorFunction: ( fieldValues, onComplete ) => {
				onComplete( null, validateAllFields( fieldValues, this.props.selectedDomainName ) );
			}
		}	);

		this.setFormState( this.formStateController.getInitialState() );
	},

	setFormState( fields ) {
		this.setState( { fields } );
	},

	onAddDnsRecord( event ) {
		event.preventDefault();

		if ( ! this.state.show ) {
			this.setState( { show: true } );
			return;
		}

		this.formStateController.handleSubmit( ( hasErrors ) => {
			if ( hasErrors ) {
				return;
			}

			const normalizedData = getNormalizedData(
				formState.getAllFieldValues( this.state.fields ),
				this.props.selectedDomainName
			);
			this.formStateController.resetFields( this.getFieldsForType( this.state.type ) );

			upgradesActions.addDns( this.props.selectedDomainName, normalizedData, ( error ) => {
				if ( error ) {
					notices.error( error.message || this.translate( 'The DNS record has not been added.' ) );
				} else {
					notices.success( this.translate( 'The DNS record has been added.' ), {
						duration: 5000
					} );
					this.setState( { show: true } );
				}
			} );
		} );
	},

	onChange( event ) {
		const { name, value } = event.target,
			skipNormalization = name === 'data' && this.state.type === 'TXT';
		this.formStateController.handleFieldChange( {
			name,
			value: skipNormalization ? value : value.trim().toLowerCase(),
		} );
	},

	changeType( event ) {
		const fields = this.getFieldsForType( event.target.value );
		this.setState( { type: event.target.value } );
		this.formStateController.resetFields( fields );
	},

	isValid( fieldName ) {
		// If the field is not active, return early so we don't get an error.
		if ( ! this.state.fields[ fieldName ] ) {
			return true;
		}

		return ! formState.isFieldInvalid( this.state.fields, fieldName );
	},

	recordFields() {
		return this.recordTypes.map( ( [ Component, showTypes ] ) => {
			return (
				<Component
					key={ Component.displayName }
					selectedDomainName={ this.props.selectedDomainName }
					show={ includes( showTypes, this.state.fields.type.value ) }
					fieldValues={ formState.getAllFieldValues( this.state.fields ) }
					isValid={ this.isValid }
					onChange={ this.onChange } />
			);
		} );
	},

	render() {
		const classes = classnames( 'form-content', { 'is-hidden': ! this.state.show } ),
			options = [ 'A', 'AAAA', 'CNAME', 'MX', 'SRV', 'TXT' ].map( function( type ) {
				return <option key={ type }>{ type }</option>;
			} ),
			isSubmitDisabled = formState.isSubmitButtonDisabled( this.state.fields ) ||
				this.props.isSubmittingForm ||
				formState.hasErrors( this.state.fields );

		return (
			<form className="dns__add-new">
				<div className={ classes }>
					<FormFieldset>
						<FormLabel>{ this.translate( 'Type', { context: 'DNS Record' } ) }</FormLabel>

						<FormSelect onChange={ this.changeType } value={ this.state.fields.type.value }>
							{ options }
						</FormSelect>
					</FormFieldset>

					{ this.recordFields() }
				</div>

				<FormFooter>
					<FormButton
						disabled={ this.state.show ? isSubmitDisabled : false }
						onClick={ this.onAddDnsRecord }>
						{ this.translate( 'Add New DNS Record' ) }
					</FormButton>

					{ this.state.show && <FormButton
						type="button"
						disabled={ this.props.isSubmittingForm }
						isPrimary={ false }
						onClick={ this.onCancel }>
						{ this.translate( 'Cancel' ) }
					</FormButton> }
				</FormFooter>
			</form>
		);
	},

	onCancel() {
		this.setState( { show: false } );
	}
} );

export default DnsAddNew;
