/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { camelCase, debounce, difference, get, isEmpty, keys, map, pick } from 'lodash';

/**
 * Internal dependencies
 */
import getContactDetailsCache from 'state/selectors/get-contact-details-cache';
import { getCurrentUserLocale } from 'state/current-user/selectors';
import { updateContactDetailsCache } from 'state/domains/management/actions';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import FormCheckbox from 'components/forms/form-checkbox';
import FormInputValidation from 'components/forms/form-input-validation';
import { Input } from 'my-sites/domains/components/form';
import { disableSubmitButton } from './with-contact-details-validation';
import wp from 'lib/wp';

const wpcom = wp.undocumented();
const ciraAgreementUrl = 'https://cira.ca/agree';
const defaultValues = {
	lang: 'EN',
	legalType: 'CCT',
	ciraAgreementAccepted: false,
};

export class RegistrantExtraInfoCaForm extends React.PureComponent {
	static propTypes = {
		contactDetails: PropTypes.object.isRequired,
		ccTldDetails: PropTypes.object.isRequired,
		onContactDetailsChange: PropTypes.func,
		contactDetailsValidationErrors: PropTypes.object,
		userWpcomLang: PropTypes.string.isRequired,
		translate: PropTypes.func.isRequired,
		updateContactDetailsCache: PropTypes.func.isRequired,
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

		this.legalTypeOptions = legalTypeOptions;
		this.state = {
			errorMessages: {},
		};
		this.validateContactDetails = debounce( this.validateContactDetails, 333 );
	}

	componentDidMount() {
		// Add defaults to redux state to make accepting default values work.
		const neededRequiredDetails = difference(
			[ 'lang', 'legalType', 'ciraAgreementAccepted' ],
			keys( this.props.ccTldDetails )
		);

		// Bail early as we already have the details from a previous purchase.
		if ( isEmpty( neededRequiredDetails ) ) {
			return;
		}

		// Set the lang to FR if user languages is French, otherwise leave EN
		if ( this.props.userWpcomLang.match( /^fr-?/i ) ) {
			defaultValues.lang = 'FR';
		}

		const payload = {
			extra: {
				ca: pick( defaultValues, neededRequiredDetails ),
			},
		};

		this.props.updateContactDetailsCache( payload );
		this.props.onContactDetailsChange?.( payload );
	}

	validateContactDetails = ( contactDetails ) => {
		wpcom.validateDomainContactInformation(
			contactDetails,
			this.props.getDomainNames(),
			( error, data ) => {
				this.setState( {
					errorMessages: ( data && data.messages ) || {},
				} );
			}
		);
	};

	handleChangeEvent = ( event ) => {
		const { value, name, checked, type, id } = event.target;
		const newContactDetails = {};

		if ( name === 'organization' ) {
			newContactDetails[ name ] = value;
			this.validateContactDetails( {
				...this.props.contactDetails,
				[ name ]: value,
			} );
		} else {
			newContactDetails.extra = {
				ca: { [ camelCase( id ) ]: type === 'checkbox' ? checked : value },
			};
		}

		this.props.updateContactDetailsCache( { ...newContactDetails } );
		this.props.onContactDetailsChange?.( { ...newContactDetails } );
	};

	needsOrganization() {
		return get( this.props.ccTldDetails, 'legalType' ) === 'CCO';
	}

	organizationFieldIsValid() {
		return isEmpty( this.getOrganizationErrorMessage() );
	}

	getOrganizationErrorMessage() {
		let message =
			this.props.contactDetailsValidationErrors?.organization ||
			( this.state.errorMessages.organization || [] ).join( '\n' );
		if ( this.needsOrganization() && isEmpty( this.props.contactDetails.organization ) ) {
			message = this.props.translate(
				'An organization name is required for Canadian corporations'
			);
		}
		return message;
	}

	renderOrganizationField() {
		const { translate, contactDetails } = this.props;
		const label = {
			label: translate( 'Organization' ),
			...( this.needsOrganization() ? {} : { labelProps: { optional: true } } ),
		};

		return (
			<FormFieldset>
				<Input
					name="organization"
					className="registrant-extra-info__organization"
					value={ contactDetails.organization || '' }
					isError={ ! this.organizationFieldIsValid() }
					errorMessage={ this.getOrganizationErrorMessage() }
					{ ...label }
					onChange={ this.handleChangeEvent }
				/>
			</FormFieldset>
		);
	}

	render() {
		const { translate, children } = this.props;
		const { legalType, ciraAgreementAccepted } = {
			...defaultValues,
			...this.props.ccTldDetails,
		};

		const formIsValid = ciraAgreementAccepted && this.organizationFieldIsValid();
		const validatingSubmitButton = formIsValid ? children : disableSubmitButton( children );

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
				{ this.renderOrganizationField() }
				{ validatingSubmitButton }
			</form>
		);
	}
}

export default connect(
	( state ) => {
		const contactDetails = getContactDetailsCache( state );
		return {
			contactDetails,
			ccTldDetails: get( contactDetails, 'extra.ca', {} ),
			userWpcomLang: getCurrentUserLocale( state ),
		};
	},
	{ updateContactDetailsCache }
)( localize( RegistrantExtraInfoCaForm ) );
