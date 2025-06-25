import page from '@automattic/calypso-router';
import { FormLabel } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { includes, find, flatMap } from 'lodash';
import PropTypes from 'prop-types';
import * as React from 'react';
import { connect } from 'react-redux';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import formState from 'calypso/lib/form-state';
import { domainManagementDns } from 'calypso/my-sites/domains/paths';
import { addDns, updateDns } from 'calypso/state/domains/dns/actions';
import { validateAllFields, getNormalizedData } from 'calypso/state/domains/dns/utils';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import ARecord from './a-record';
import AliasRecord from './alias-record';
import CaaRecord from './caa-record';
import CnameRecord from './cname-record';
import MxRecord from './mx-record';
import NsRecord from './ns-record';
import SrvRecord from './srv-record';
import TxtRecord from './txt-record';

const initialState = {
	fields: null,
	type: 'A',
};

class DnsAddNew extends React.Component {
	static propTypes = {
		isSubmittingForm: PropTypes.bool.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
		goBack: PropTypes.func,
		recordToEdit: PropTypes.object,
	};

	constructor( props ) {
		super( props );
		const { translate, selectedDomain, selectedDomainName } = props;

		this.dnsRecords = [
			{
				component: ARecord,
				types: [ 'A', 'AAAA' ],
				description: translate(
					'An A record is used to point a domain (e.g. example.com) or a subdomain (e.g. subdomain.example.com) to an IP address (192.168.1.1).'
				),
				initialFields: {
					name: '',
					ttl: 3600,
					data: '',
				},
			},
			{
				component: AliasRecord,
				types: [ 'ALIAS' ],
				description: translate(
					'An ALIAS record is a non-standard DNS record that is used to direct your domain to the target domain. The IP address of the target is resolved on the DNS server.'
				),
				initialFields: {
					name: '@',
					ttl: 3600,
					data: '',
				},
			},
			{
				component: CaaRecord,
				types: [ 'CAA' ],
				initialFields: {
					name: '',
					flags: '0',
					tag: 'issue',
					value: '',
					ttl: 3600,
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
					ttl: 3600,
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
					ttl: 3600,
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
					ttl: 3600,
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
					ttl: 3600,
					service: '',
					aux: 10,
					weight: 10,
					target: '',
					port: '',
					protocol: '_tcp',
				},
			},
			{
				component: NsRecord,
				types: [ 'NS' ],
				description: translate(
					'NS (name server) records are used to delegate the authoritative DNS servers for a subdomain.'
				),
				initialFields: {
					name: '',
					ttl: 86400,
					data: '',
				},
			},
		];

		this.formStateController = formState.Controller( {
			initialFields: this.getFieldsForType( initialState.type ),
			onNewState: this.setFormState,
			validatorFunction: ( fieldValues, onComplete ) => {
				onComplete( null, validateAllFields( fieldValues, selectedDomainName, selectedDomain ) );
			},
		} );

		this.state = {
			...initialState,
			fields: this.formStateController.getInitialState(),
		};
	}

	getFieldsForType( type ) {
		const dnsRecord =
			find( this.dnsRecords, ( record ) => {
				return includes( record.types, type );
			} ) ?? this.dnsRecords[ 0 ];

		return {
			...dnsRecord.initialFields,
			type,
		};
	}

	componentDidMount() {
		if ( this.props.recordToEdit ) {
			this.loadRecord();
		}
	}

	loadRecord() {
		const { recordToEdit } = this.props;

		const selectedDnsRecordFields = this.getFieldsForType( recordToEdit.type );
		const recordAttributes = Object.keys( selectedDnsRecordFields ).reduce( ( obj, field ) => {
			obj[ field ] = this.getProcessedRecordValue( field );
			return obj;
		}, {} );

		this.setState( { type: recordToEdit.type } );
		this.formStateController.resetFields( recordAttributes );
	}

	getProcessedRecordValue( field ) {
		const { recordToEdit } = this.props;

		const isRootDomainRecord = recordToEdit.name === `${ recordToEdit.domain }.`;
		if ( isRootDomainRecord && 'name' === field ) {
			return '';
		}

		// SRV records can have a target of '.', which means that service is unavailable
		if ( 'SRV' === recordToEdit.type && 'target' === field && '.' === recordToEdit[ field ] ) {
			return '.';
		}

		if ( [ 'data', 'target' ].includes( field ) && 'TXT' !== recordToEdit.type ) {
			return recordToEdit[ field ].replace( /\.$/, '' );
		}

		// Make sure we can handle protocols with and without a leading underscore
		if ( 'SRV' === recordToEdit.type && 'protocol' === field ) {
			return recordToEdit[ field ].replace( /^_*/, '_' );
		}

		return recordToEdit[ field ];
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.recordToEdit !== this.props.recordToEdit && this.props.recordToEdit ) {
			this.loadRecord();
		}
	}

	setFormState = ( fields ) => {
		this.setState( { fields } );
	};

	onAddOrUpdateDnsRecord = ( event ) => {
		event.preventDefault();
		const { recordToEdit, selectedDomain, selectedDomainName, translate } = this.props;

		this.formStateController.handleSubmit( ( hasErrors ) => {
			if ( hasErrors ) {
				return;
			}

			const normalizedData = getNormalizedData(
				formState.getAllFieldValues( this.state.fields ),
				selectedDomainName,
				selectedDomain
			);

			if ( recordToEdit ) {
				this.props.updateDns( selectedDomainName, [ normalizedData ], [ recordToEdit ] ).then(
					() => this.handleSuccess( translate( 'The DNS record has been updated.' ) ),
					( error ) =>
						this.handleError( error, translate( 'The DNS record has not been updated.' ) )
				);
				return;
			}

			this.props.addDns( selectedDomainName, normalizedData ).then(
				() => this.handleSuccess( translate( 'The DNS record has been added.' ) ),
				( error ) => this.handleError( error, translate( 'The DNS record has not been added.' ) )
			);
		} );
	};

	handleSuccess = ( message ) => {
		const { currentRoute, selectedSite, selectedDomainName } = this.props;

		page( domainManagementDns( selectedSite.slug, selectedDomainName, currentRoute ) );
		this.props.successNotice( message, { duration: 3000 } );
	};

	handleError = ( error, message ) => {
		this.props.errorNotice( error.message || message );
	};

	onChange = ( event ) => {
		const { name, value } = event.target;
		const skipNormalization = name === 'data' && this.state.type === 'TXT';
		// Strip zero width spaces from the value
		const filteredValue = value.replace( /\u200B/g, '' );

		this.formStateController.handleFieldChange( {
			name,
			value: skipNormalization ? filteredValue : filteredValue.trim().toLowerCase(),
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

		// Specific to NS records, avoid invalid state by checking if the target Host field is at *.wordpress.com
		if (
			this.state.fields.type.value === 'NS' &&
			fieldName === 'data' &&
			/\.wordpress\.com$/i.test( this.state.fields.data.value ) // matches on ns1.wordpress.com, ns2.wordpress.com, *.wordpress.com, etc.
		) {
			return false;
		}

		return ! formState.isFieldInvalid( this.state.fields, fieldName );
	};

	renderFields( selectedRecordType ) {
		return (
			<selectedRecordType.component
				selectedDomain={ this.props.selectedDomain }
				selectedDomainName={ this.props.selectedDomainName }
				show
				fieldValues={ formState.getAllFieldValues( this.state.fields ) }
				isValid={ this.isValid }
				onChange={ this.onChange }
			/>
		);
	}

	render() {
		const { recordToEdit, translate } = this.props;
		const dnsRecordTypes = flatMap( this.dnsRecords, ( dnsRecord ) => dnsRecord.types );
		const options = dnsRecordTypes.map( ( type ) => <option key={ type }>{ type }</option> );
		const isSubmitDisabled =
			formState.isSubmitButtonDisabled( this.state.fields ) ||
			this.props.isSubmittingForm ||
			formState.hasErrors( this.state.fields );
		const selectedRecordType = this.dnsRecords.find( ( record ) =>
			record.types.includes( this.state.type )
		);
		const buttonLabel = recordToEdit
			? translate( 'Update DNS record' )
			: translate( 'Add DNS record' );

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
					<FormSettingExplanation>{ selectedRecordType.description }</FormSettingExplanation>
				</FormFieldset>
				{ selectedRecordType && this.renderFields( selectedRecordType ) }
				<div className="dns__form-buttons">
					<FormButton disabled={ isSubmitDisabled } onClick={ this.onAddOrUpdateDnsRecord }>
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

export default connect(
	( state ) => {
		const selectedSite = getSelectedSite( state );
		const currentRoute = getCurrentRoute( state );
		return { selectedSite, currentRoute };
	},
	{
		addDns,
		updateDns,
		errorNotice,
		successNotice,
	}
)( localize( DnsAddNew ) );
