/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { camelCase, difference, isEmpty, keys, map, pick } from 'lodash';

/**
 * Internal dependencies
 */
import { getContactDetailsCache } from 'state/selectors';
import { getCurrentUserLocale } from 'state/current-user/selectors';
import {
	updateContactDetailsCache,
	validateContactDetailsCache,
} from 'state/domains/management/actions';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import FormCheckbox from 'components/forms/form-checkbox';
import FormInputValidation from 'components/forms/form-input-validation';
import { Input } from 'my-sites/domains/components/form';
import { disableSubmitButton } from './with-contact-details-validation';

const ciraAgreementUrl = 'https://services.cira.ca/agree/agreement/agreementVersion2.0.jsp';
const defaultValues = {
	lang: 'EN',
	legalType: 'CCT',
	ciraAgreementAccepted: false,
};

export class RegistrantExtraInfoCaForm extends React.PureComponent {
	static propTypes = {
		contactDetails: PropTypes.object.isRequired,
		userWpcomLang: PropTypes.string.isRequired,
		translate: PropTypes.func.isRequired,
	};

	constructor( props ) {
		super( props );
		const { translate } = props;
		const legalTypes = {
			CCT: translate( 'Canadian Citizen' ),
			CCO: translate( 'Canadian Corporation' ),
			RES: translate( 'Permanent Resident' ),
			GOV: translate( 'Government' ),
			EDU: translate( 'Educational Institution' ),
			ASS: translate( 'Unincorporated Association', {
				comment:
					'Refers to Canadian legal concept -- encompasses entities ' +
					'like religious congregations, social clubs, community groups, etc',
			} ),
			HOP: translate( 'Hospital' ),
			PRT: translate( 'Partnership' ),
			TDM: translate( 'Trademark Owner' ),
			TRD: translate( 'Trade Union' ),
			PLT: translate( 'Political Party' ),
			LAM: translate( 'Library, Archive, or Museum' ),
			TRS: translate( 'Trust', {
				comment: 'Refers to the legal concept of trust (noun)',
			} ),
			ABO: translate( 'Aboriginal Peoples', {
				comment: 'Refers to indigenous peoples, specifically of Canada.',
			} ),
			INB: translate( 'Indian Band', {
				comment:
					'Refers to Canadian legal concept -- Indian meaning the ' +
					'indigeonous people of North America and band meaning a small ' +
					'group or community',
			} ),
			LGR: translate( 'Legal Representative' ),
			OMK: translate( 'Official Mark', {
				comment: 'Refers to a Canadian legal concept -- similar to a trademark',
			} ),
			MAJ: translate( 'Her Majesty the Queen' ),
		};
		const legalTypeOptions = map( legalTypes, ( text, optionValue ) => (
			<option value={ optionValue } key={ optionValue }>
				{ text }
			</option>
		) );

		this.legalTypes = legalTypes;
		this.legalTypeOptions = legalTypeOptions;
	}

	componentWillMount() {
		// Add defaults to redux state to make accepting default values work.
		const neededRequiredDetails = difference(
			[ 'lang', 'legalType', 'ciraAgreementAccepted' ],
			keys( this.props.contactDetails.extra )
		);

		// Bail early as we already have the details from a previous purchase.
		if ( isEmpty( neededRequiredDetails ) ) {
			return;
		}

		// Set the lang to FR if user languages is French, otherwise leave EN
		if ( this.props.userWpcomLang.match( /^fr-?/i ) ) {
			defaultValues.lang = 'FR';
		}

		this.props.updateContactDetailsCache( {
			extra: pick( defaultValues, neededRequiredDetails ),
		} );
	}

	handleChangeEvent = event => {
		const { target } = event;
		let { value, type, id } = target;

		if ( type === 'checkbox' ) {
			value = target.checked;
		}

		const path = id === 'organization' ? [ id ] : [ 'extra', id ];

		const data = set( {}, path, value );

		this.props.updateContactDetailsCache( {
			extra: { [ camelCase( event.target.id ) ]: value },
		} );
	};

	renderOrganizationField() {
		// These props include all the values and callbacks we need to
		// have this organization field behave the same as the field in the
		// parent (domain-details-form), particularly around the
		// formState and back end validation

		const { translate } = this.props;
		const className = 'registrant-extra-info';

		return (
			<FormFieldset>
				<Input
					className={ className }
					label={ translate( 'Organization' ) }
					onChange={ this.handleChangeEvent }
					errorMessage={ 'TODO: Errors here' }
				/>
			</FormFieldset>
		);
	}

	/*
	 * We've already got most of the validation we need from the server, we
	 * just need to add a check for the empty field.
	 * We're doing that one rule here because we're handling the organization
	 * through flux and the legal type through redux, and with this check that
	 * straddles the boundary, the cleanest approach is to handle it here in the
	 * component.
	 */
	validateOrganizationIsNotEmpty() {
		const { translate } = this.props;
		const organization = get( this.props, [ 'contactDetails', 'organization' ] );
		const requiredFieldError = {
			isError: true,
			errorMessage: translate( 'An organization name is required for Canadian corporations' ),
		};

		return organizationFieldProps.value ? {} : requiredFieldError;
	}

	validateContactDetails() {
		console.log( 'TODO' );
	}

	render() {
		const { translate } = this.props;
		const { legalType, ciraAgreementAccepted } = {
			...defaultValues,
			...this.props.contactDetails.extra,
		};

		const validationErrorsFromTheServer = {};

		// We have to validate the organization name for the CCO legal
		// type to avoid OpenSRS rejecting them and causing errors during
		// payments
		const organizationFieldProps = this.validateOrganizationIsNotEmpty();

		const doesntNeedOrganizationField = legalType !== 'CCO';
		const organizationFieldIsValid =
			doesntNeedOrganizationField || ! organizationFieldProps.isError;

		const formIsValid = ciraAgreementAccepted && organizationFieldIsValid;
		const validatingSubmitButton = formIsValid
			? this.props.children
			: disableSubmitButton( this.props.children );

		return (
			<form className="registrant-extra-info__form">
				<p className="registrant-extra-info__form-desciption">
					{ translate( 'Almost done! We need some extra details to register your %(tld)s domain.', {
						args: { tld: '.ca' },
					} ) }
				</p>
				<FormFieldset>
					<FormLabel htmlFor="legal-type">
						{ translate( 'Choose the option that best describes your Canadian presence:' ) }
					</FormLabel>
					<FormSelect
						id="legal-type"
						value={ legalType }
						className="registrant-extra-info__form-legal-type"
						onChange={ this.handleChangeEvent }
					>
						{ this.legalTypeOptions }
					</FormSelect>
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="legal-type">{ translate( 'CIRA Agreement' ) }</FormLabel>
					<FormLabel>
						<FormCheckbox
							id="cira-agreement-accepted"
							checked={ ciraAgreementAccepted }
							onChange={ this.handleChangeEvent }
						/>
						<span>
							{ translate( 'I have read and agree to the {{a}}CIRA Registrant Agreement{{/a}}', {
								components: {
									a: <a target="_blank" rel="noopener noreferrer" href={ ciraAgreementUrl } />,
								},
							} ) }
						</span>
						{ ciraAgreementAccepted || (
							<FormInputValidation text={ translate( 'Required' ) } isError={ true } />
						) }
					</FormLabel>
				</FormFieldset>
				{ doesntNeedOrganizationField || this.renderOrganizationField( organizationFieldProps ) }
				{ validatingSubmitButton }
			</form>
		);
	}
}

export default connect(
	state => ( {
		contactDetails: getContactDetailsCache( state ),
		userWpcomLang: getCurrentUserLocale( state ),
	} ),
	{ updateContactDetailsCache }
)( localize( RegistrantExtraInfoCaForm ) );
