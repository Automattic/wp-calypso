import { FormInputValidation } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { camelCase, difference, get, isEmpty, keys, map, pick } from 'lodash';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSelect from 'calypso/components/forms/form-select';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { updateContactDetailsCache } from 'calypso/state/domains/management/actions';
import getContactDetailsCache from 'calypso/state/selectors/get-contact-details-cache';

const ciraAgreementUrl = 'https://www.cira.ca/en/resources/documents/about/registrant-agreement/';
const defaultValues = {
	lang: 'EN',
	legalType: 'CCT',
	ciraAgreementAccepted: false,
};

export class RegistrantExtraInfoCaForm extends PureComponent {
	static propTypes = {
		contactDetails: PropTypes.object.isRequired,
		ccTldDetails: PropTypes.object.isRequired,
		onContactDetailsChange: PropTypes.func,
		contactDetailsValidationErrors: PropTypes.object,
		userWpcomLang: PropTypes.string,
		translate: PropTypes.func.isRequired,
		updateContactDetailsCache: PropTypes.func.isRequired,
		isManaged: PropTypes.bool,
	};

	static defaultProps = {
		userWpcomLang: 'EN',
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
			MAJ: translate( 'His Majesty the King' ),
		};
		const legalTypeOptions = map( legalTypes, ( text, optionValue ) => (
			<option value={ optionValue } key={ optionValue }>
				{ text }
			</option>
		) );

		this.legalTypeOptions = legalTypeOptions;
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
		if ( this.props.userWpcomLang?.match( /^fr-?/i ) ) {
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

	handleChangeEvent = ( event ) => {
		const { value, checked, type, id } = event.target;
		const newContactDetails = {};

		newContactDetails.extra = {
			ca: { [ camelCase( id ) ]: type === 'checkbox' ? checked : value },
		};

		this.props.updateContactDetailsCache( { ...newContactDetails } );

		if ( this.props.isManaged ) {
			this.props.onContactDetailsChange?.( { ...newContactDetails } );
		}
	};

	getCiraAgreementAcceptedErrorMessage() {
		if ( this.props.isManaged ) {
			return (
				this.props.contactDetailsValidationErrors?.extra?.ca?.ciraAgreementAccepted ??
				this.props.translate( 'Required' )
			);
		}

		return this.props.translate( 'Required' );
	}

	render() {
		const { translate } = this.props;
		const { legalType, ciraAgreementAccepted } = {
			...defaultValues,
			...this.props.ccTldDetails,
		};

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
							<FormInputValidation
								text={ this.getCiraAgreementAcceptedErrorMessage() }
								isError={ true }
							/>
						) }
					</FormLabel>
				</FormFieldset>
			</form>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		if ( ownProps.isManaged ) {
			return {
				// Treat this like a managed component, except for userWpcomLang.
				contactDetails: ownProps.contactDetails ?? {},
				ccTldDetails: ownProps.ccTldDetails ?? {},
				userWpcomLang: getCurrentUserLocale( state ),
				contactDetailsValidationErrors: ownProps.contactDetailsValidationErrors ?? {},
			};
		}

		const contactDetails = getContactDetailsCache( state );
		return {
			contactDetails,
			ccTldDetails: get( contactDetails, 'extra.ca', {} ),
			userWpcomLang: getCurrentUserLocale( state ),
		};
	},
	{ updateContactDetailsCache }
)( localize( RegistrantExtraInfoCaForm ) );
