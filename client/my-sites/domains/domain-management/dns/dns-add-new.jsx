/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { assign, includes, find, flatMap } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ARecord from './a-record';
import CnameRecord from './cname-record';
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormFooter from 'my-sites/domains/domain-management/components/form-footer';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import MxRecord from './mx-record';
import TxtRecord from './txt-record';
import SrvRecord from './srv-record';
import formState from 'lib/form-state';
import { errorNotice, successNotice } from 'state/notices/actions';
import * as upgradesActions from 'lib/upgrades/actions';
import { validateAllFields, getNormalizedData } from 'lib/domains/dns';

class DnsAddNew extends React.Component {
	static propTypes = {
		isSubmittingForm: React.PropTypes.bool.isRequired,
		selectedDomainName: React.PropTypes.string.isRequired
	};

	state = {
		fields: null,
		type: 'A'
	};

	recordTypes = [
		[ ARecord, [ 'A', 'AAAA' ] ],
		[ CnameRecord, [ 'CNAME' ] ],
		[ MxRecord, [ 'MX' ] ],
		[ TxtRecord, [ 'TXT' ] ],
		[ SrvRecord, [ 'SRV' ] ]
	];

	getFieldsForType( type ) {
		/* eslint-disable no-unused-vars, no-shadow */
		// _ is not used anywhere, it is only a positional arg to have more readable code
		const [ Component, _ ] = find( this.recordTypes, ( [ _, types ] ) => {
		/* eslint-enable no-unused-vars, no-shadow */
			return includes( types, type );
		} );

		return assign(
			{},
			Component.initialFields || Component._composedComponent.initialFields,
			{ type }
		);
	}

	componentWillMount() {
		this.formStateController = formState.Controller( {
			initialFields: this.getFieldsForType( this.state.type ),
			onNewState: this.setFormState,
			validatorFunction: ( fieldValues, onComplete ) => {
				onComplete( null, validateAllFields( fieldValues, this.props.selectedDomainName ) );
			}
		} );

		this.setFormState( this.formStateController.getInitialState() );
	}

	setFormState = ( fields ) => {
		this.setState( { fields } );
	};

	onAddDnsRecord = ( event ) => {
		event.preventDefault();
		const { translate } = this.props;

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
					this.props.errorNotice(
						error.message || translate( 'The DNS record has not been added.' )
					);
				} else {
					this.props.successNotice(
						translate( 'The DNS record has been added.' ),
						{
							duration: 5000
						}
					);
				}
			} );
		} );
	};

	onChange = ( event ) => {
		const { name, value } = event.target;
		const skipNormalization = name === 'data' && this.state.type === 'TXT';

		this.formStateController.handleFieldChange( {
			name,
			value: skipNormalization ? value : value.trim().toLowerCase(),
		} );
	};

	changeType = ( event ) => {
		const fields = this.getFieldsForType( event.target.value );

		this.setState( { type: event.target.value } );
		this.formStateController.resetFields( fields );
	};

	isValid = ( fieldName ) => {
		// If the field is not active, return early so we don't get an error.
		if ( ! this.state.fields[ fieldName ] ) {
			return true;
		}

		return ! formState.isFieldInvalid( this.state.fields, fieldName );
	};

	recordFields() {
		return this.recordTypes.map( ( [ Component, showTypes ] ) => {
			return (
				<Component
					key={ showTypes.join( ',' ) }
					selectedDomainName={ this.props.selectedDomainName }
					show={ includes( showTypes, this.state.fields.type.value ) }
					fieldValues={ formState.getAllFieldValues( this.state.fields ) }
					isValid={ this.isValid }
					onChange={ this.onChange }
				/>
			);
		} );
	}

	render() {
		const { translate } = this.props;
		const dnsRecordTypes = flatMap( this.recordTypes, ( record ) => record[ 1 ] );
		const options = dnsRecordTypes.map(
			( type ) => <option key={ type }>{ type }</option>
		);
		const isSubmitDisabled = formState.isSubmitButtonDisabled( this.state.fields ) ||
			this.props.isSubmittingForm ||
			formState.hasErrors( this.state.fields );

		return (
			<form className="dns__add-new">
				<div className="dns__form-content">
					<FormFieldset>
						<FormLabel>
							{ translate( 'Type', { context: 'DNS Record' } ) }
						</FormLabel>

						<FormSelect onChange={ this.changeType } value={ this.state.fields.type.value }>
							{ options }
						</FormSelect>
					</FormFieldset>

					{ this.recordFields() }
				</div>

				<FormFooter>
					<FormButton disabled={ isSubmitDisabled } onClick={ this.onAddDnsRecord }>
						{ translate( 'Add New DNS Record' ) }
					</FormButton>
				</FormFooter>
			</form>
		);
	}
}

export default connect(
	null,
	{
		errorNotice,
		successNotice,
	}
)( localize( DnsAddNew ) );
