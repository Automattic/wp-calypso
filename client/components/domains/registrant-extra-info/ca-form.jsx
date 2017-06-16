/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import {
	camelCase,
	map,
} from 'lodash';

/**
 * Internal dependencies
 */
import { getContactDetailsExtraCache } from 'state/selectors';
import { updateContactDetailsCache } from 'state/domains/management/actions';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import FormCheckbox from 'components/forms/form-checkbox';

const legalTypes = {
	ABO: 'Aboriginal',
	ASS: 'Association (Unincorporated)',
	CCO: 'Canadian Corporation',
	CCT: 'Canadian Citizen',
	EDU: 'Educational Institution',
	GOV: 'Government',
	HOP: 'Hospital',
	INB: 'Indian Band',
	LAM: 'Library, Archive, or Museum',
	LGR: 'Legal Representative',
	MAJ: 'Her Majesty the Queen',
	// An official mark is Canadian thing like a trademark for public authorities
	OMK: 'Official Mark',
	PLT: 'Political Party',
	PRT: 'Partnership',
	RES: 'Permanent Resident',
	TDM: 'Trademark Owner',
	TRD: 'Trade Union',
	TRS: 'Trust',
};

const legalTypeOptions = map( legalTypes, ( text, optionValue ) =>
	<option value={ optionValue } key={ optionValue }>{ text }</option>
);

const defaultValues = {
	legalType: 'CCW',
	isVisible: true,
	ciraAgreementAccepted: false,
	onSubmit: noop,
};

class RegistrantExtraInfoCaForm extends React.PureComponent {
	static propTypes = {
		ciraAgreementAccepted: PropTypes.bool,
		legalType: PropTypes.string,
		isVisible: PropTypes.bool,
		onSubmit: PropTypes.func,
	}

	constructor( props ) {
		super( props );

		this.props.contactDetails.extra = {
			...defaultValues,
			...this.props.contactDetails.extra
		};
	}

	handleChangeEvent = ( event ) => {
		const { target } = event;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		this.props.updateContactDetailsCache( {
			extra: { [ camelCase( event.target.id ) ]: value },
		} );
	}

	render() {
		const { translate } = this.props;
		const {
			legalType,
			ciraAgreementAccepted,
		} = { ...defaultValues, ...this.props.contactDetails };

		const ciraAgreementUrl = 'https://services.cira.ca/agree/agreement/agreementVersion2.0.jsp';

		return (
			<form className="registrant-extra-info__form">
				<h1 className="registrant-extra-info__form-title">
					{ translate(
						'Registering a .CA domain'
					) }
				</h1>
				<p className="registrant-extra-info__form-desciption">
					{ translate(
						'Almost done! We need some extra details to register domains ending in ".ca".'
					) }
				</p>
				<FormFieldset>
					<FormLabel htmlFor="legal-type">
						{ translate( 'Choose the option that best describes you:' ) }
					</FormLabel>
					<FormSelect
						id="legal-type"
						value={ legalType }
						className="registrant-extra-info__form-legal-type"
						onChange={ this.handleChangeEvent }>
						{ legalTypeOptions }
					</FormSelect>
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="legal-type">
						{ translate( 'CIRA Agreement' ) }
					</FormLabel>
					<FormLabel>
						<FormCheckbox
							id="cira-agreement-accepted"
							value={ ciraAgreementAccepted }
							onChange={ this.handleChangeEvent } />
						<span>{
							translate( 'I have read and agree to the {{a}}CIRA Registrant Agreement{{/a}}',
								{
									components: {
										a: <a href={ ciraAgreementUrl } />,
									}
								}
							)
						}</span>
					</FormLabel>
				</FormFieldset>

				{ this.props.children }
			</form>
		);
	}
}

export default connect(
	state => ( { contactDetails: getContactDetailsExtraCache( state ) } ),
	{ updateContactDetailsCache }
)( localize( RegistrantExtraInfoCaForm ) );
