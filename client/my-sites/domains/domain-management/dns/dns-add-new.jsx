/**
 * External dependencies
 */
import PropTypes from 'prop-types';
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
import { addDns } from 'state/domains/dns/actions';
import { validateAllFields, getNormalizedData } from 'state/domains/dns/utils';

class DnsAddNew extends React.Component {
	static propTypes = {
		isSubmittingForm: PropTypes.bool.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
	};

	state = {
		fields: null,
		type: 'A',
	};

	dnsRecords = [
		{
			component: ARecord,
			types: [ 'A', 'AAAA' ],
			initialFields: {
				name: '',
				data: '',
			},
		},
		{
			component: CnameRecord,
			types: [ 'CNAME' ],
			initialFields: {
				name: '',
				data: '',
			},
		},
		{
			component: MxRecord,
			types: [ 'MX' ],
			initialFields: {
				name: '',
				data: '',
				aux: 10,
			},
		},
		{
			component: TxtRecord,
			types: [ 'TXT' ],
			initialFields: {
				name: '',
				data: '',
			},
		},
		{
			component: SrvRecord,
			types: [ 'SRV' ],
			initialFields: {
				name: '',
				service: '',
				aux: 10,
				weight: 10,
				target: '',
				port: '',
				protocol: 'tcp',
			},
		},
	];

	getFieldsForType( type ) {
		const dnsRecord = find( this.dnsRecords, ( record ) => {
			return includes( record.types, type );
		} );

		return assign( {}, dnsRecord.initialFields, { type } );
	}

	UNSAFE_componentWillMount() {
		this.formStateController = formState.Controller( {
			initialFields: this.getFieldsForType( this.state.type ),
			onNewState: this.setFormState,
			validatorFunction: ( fieldValues, onComplete ) => {
				onComplete( null, validateAllFields( fieldValues, this.props.selectedDomainName ) );
			},
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

			this.props.addDns( this.props.selectedDomainName, normalizedData ).then(
				() =>
					this.props.successNotice( translate( 'The DNS record has been added.' ), {
						duration: 5000,
					} ),
				( error ) =>
					this.props.errorNotice(
						error.message || translate( 'The DNS record has not been added.' )
					)
			);
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
		return this.dnsRecords.map( ( dnsRecord ) => {
			const { component: Component, types: showTypes } = dnsRecord;

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
		const dnsRecordTypes = flatMap( this.dnsRecords, ( dnsRecord ) => dnsRecord.types );
		const options = dnsRecordTypes.map( ( type ) => <option key={ type }>{ type }</option> );
		const isSubmitDisabled =
			formState.isSubmitButtonDisabled( this.state.fields ) ||
			this.props.isSubmittingForm ||
			formState.hasErrors( this.state.fields );

		return (
			<form className="dns__form">
				<FormFieldset>
					<FormLabel>{ translate( 'Type', { context: 'DNS Record' } ) }</FormLabel>
					<FormSelect
						className="dns__add-new-select-type"
						onChange={ this.changeType }
						value={ this.state.fields.type.value }
					>
						{ options }
					</FormSelect>
				</FormFieldset>
				{ this.recordFields() }
				<FormFooter>
					<FormButton disabled={ isSubmitDisabled } onClick={ this.onAddDnsRecord }>
						{ translate( 'Add new DNS record' ) }
					</FormButton>
				</FormFooter>
			</form>
		);
	}
}

export default connect( null, {
	addDns,
	errorNotice,
	successNotice,
} )( localize( DnsAddNew ) );
