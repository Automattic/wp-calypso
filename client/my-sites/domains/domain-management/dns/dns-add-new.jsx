import { localize } from 'i18n-calypso';
import { includes, find, flatMap } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import * as React from 'react';
import { connect } from 'react-redux';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSelect from 'calypso/components/forms/form-select';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import formState from 'calypso/lib/form-state';
import { domainManagementDns } from 'calypso/my-sites/domains/paths';
import { addDns, updateDns } from 'calypso/state/domains/dns/actions';
import { validateAllFields, getNormalizedData } from 'calypso/state/domains/dns/utils';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import ARecord from './a-record';
import CnameRecord from './cname-record';
import MxRecord from './mx-record';
import SrvRecord from './srv-record';
import TxtRecord from './txt-record';

class DnsAddNew extends React.Component {
	static propTypes = {
		isSubmittingForm: PropTypes.bool.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSiteSlug: PropTypes.string,
		goBack: PropTypes.func,
		recordToEdit: PropTypes.object,
	};

	constructor( props ) {
		super( props );
		const { translate } = props;

		this.state = {
			fields: null,
			type: 'A',
		};

		this.dnsRecords = [
			{
				component: ARecord,
				types: [ 'A', 'AAAA' ],
				description: translate(
					'An A record is used to point a domain (e.g. example.com) or a subdomain (e.g. subdomain.example.com) to an IP address (192.168.1.1).'
				),
				initialFields: {
					name: '',
					data: '',
				},
			},
			{
				component: CnameRecord,
				types: [ 'CNAME' ],
				description: translate(
					'CNAME (canonical name) records are typically used to link a subdomain (e.g. subdomain.example.com) to a domain (e.g. example.com).'
				),
				initialFields: {
					name: '',
					data: '',
				},
			},
			{
				component: MxRecord,
				types: [ 'MX' ],
				description: translate(
					'MX (mail exchange) records are used to route emails to the correct mail servers.'
				),
				initialFields: {
					name: '',
					data: '',
					aux: 10,
				},
			},
			{
				component: TxtRecord,
				types: [ 'TXT' ],
				description: translate(
					"TXT (text) records are used to record any textual information on a domain. They're typically used by other service providers (e.g. email services) to ensure you are the owner of the domain."
				),
				initialFields: {
					name: '',
					data: '',
				},
			},
			{
				component: SrvRecord,
				types: [ 'SRV' ],
				description: translate(
					'SRV (service) records define the information to access certain internet services.'
				),
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
	}

	getFieldsForType( type ) {
		const dnsRecord = find( this.dnsRecords, ( record ) => {
			return includes( record.types, type );
		} );

		return {
			...dnsRecord.initialFields,
			type,
		};
	}

	UNSAFE_componentWillMount() {
		this.formStateController = formState.Controller( {
			initialFields: this.getFieldsForType( this.state.type ),
			onNewState: this.setFormState,
			validatorFunction: ( fieldValues, onComplete ) => {
				onComplete( null, validateAllFields( fieldValues, this.props.selectedDomainName ) );
			},
		} );

		if ( this.props.recordToEdit ) {
			this.loadRecord();
		} else {
			this.setFormState( this.formStateController.getInitialState() );
		}
	}

	loadRecord() {
		const { recordToEdit } = this.props;

		const selectedDnsRecordFields = this.getFieldsForType( recordToEdit.type );
		const recordAttributes = Object.keys( selectedDnsRecordFields ).reduce( ( obj, field ) => {
			obj[ field ] = recordToEdit[ field ];
			return obj;
		}, {} );

		this.formStateController.resetFields( recordAttributes );
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.recordToEdit !== this.props.recordToEdit ) {
			this.loadRecord();
		}
	}

	setFormState = ( fields ) => {
		this.setState( { fields } );
	};

	onAddDnsRecord = ( event ) => {
		event.preventDefault();
		const { recordToEdit, selectedDomainName, selectedSiteSlug, translate } = this.props;

		this.formStateController.handleSubmit( ( hasErrors ) => {
			if ( hasErrors ) {
				return;
			}

			const normalizedData = getNormalizedData(
				formState.getAllFieldValues( this.state.fields ),
				selectedDomainName
			);
			this.formStateController.resetFields( this.getFieldsForType( this.state.type ) );

			if ( recordToEdit ) {
				this.props.updateDns( selectedDomainName, [ normalizedData ], [ recordToEdit ] ).then(
					() => {
						page( domainManagementDns( selectedSiteSlug, selectedDomainName ) );
						this.props.successNotice( translate( 'The DNS record has been updated.' ), {
							duration: 5000,
						} );
					},
					( error ) => {
						this.props.errorNotice(
							error.message || translate( 'The DNS record has not been updated.' )
						);
					}
				);
				return;
			}

			this.props.addDns( selectedDomainName, normalizedData ).then(
				() => {
					page( domainManagementDns( selectedSiteSlug, selectedDomainName ) );
					this.props.successNotice( translate( 'The DNS record has been added.' ), {
						duration: 5000,
					} );
				},
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
		const { recordToEdit, translate } = this.props;
		const dnsRecordTypes = flatMap( this.dnsRecords, ( dnsRecord ) => dnsRecord.types );
		const options = dnsRecordTypes.map( ( type ) => <option key={ type }>{ type }</option> );
		const isSubmitDisabled =
			formState.isSubmitButtonDisabled( this.state.fields ) ||
			this.props.isSubmittingForm ||
			formState.hasErrors( this.state.fields );
		const selectedType = this.dnsRecords.find( ( record ) =>
			record.types.includes( this.state.type )
		);
		const buttonLabel = recordToEdit
			? translate( 'Update DNS record' )
			: translate( 'Add new DNS record' );

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
					<FormSettingExplanation>{ selectedType.description }</FormSettingExplanation>
				</FormFieldset>
				{ this.recordFields() }
				<div className="dns__form-buttons">
					<FormButton disabled={ isSubmitDisabled } onClick={ this.onAddDnsRecord }>
						{ buttonLabel }
					</FormButton>
					<FormButton isPrimary={ false } type="button" onClick={ this.props.goBack }>
						{ translate( 'Cancel' ) }
					</FormButton>
				</div>
			</form>
		);
	}
}

export default connect( null, {
	addDns,
	updateDns,
	errorNotice,
	successNotice,
} )( localize( DnsAddNew ) );
