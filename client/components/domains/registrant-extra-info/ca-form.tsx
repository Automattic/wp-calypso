import { FormInputValidation, FormLabel } from '@automattic/components';
import { LocalizeProps, localize } from 'i18n-calypso';
import { camelCase, difference, isEmpty, keys, map, pick } from 'lodash';
import { PureComponent, ReactNode } from 'react';
import { connect } from 'react-redux';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import type { DomainContactDetails } from '@automattic/shopping-cart';
import type { DomainContactDetailsErrors } from '@automattic/wpcom-checkout';

import './style.scss';

const ciraAgreementUrl = 'https://www.cira.ca/en/resources/documents/about/registrant-agreement/';
const defaultValues = {
	lang: 'EN',
	legalType: 'CCT',
	ciraAgreementAccepted: false,
};

export interface FormProps {
	contactDetails: Record< string, unknown >;
	ccTldDetails: Record< string, unknown >;
	onContactDetailsChange?: ( payload: DomainContactDetails ) => void;
	contactDetailsValidationErrors: DomainContactDetailsErrors;
	isVisible?: boolean;
	onSubmit?: () => void;
}

export interface FormReduxProps {
	userWpcomLang: string;
}

export class RegistrantExtraInfoCaForm extends PureComponent<
	FormProps & FormReduxProps & LocalizeProps
> {
	static defaultProps = {
		userWpcomLang: 'EN',
	};

	legalTypeOptions: ReactNode[];

	constructor( props: FormProps & FormReduxProps & LocalizeProps ) {
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

		this.props.onContactDetailsChange?.( payload );
	}

	handleChangeEvent = ( event: {
		target: { id: string; value: string; checked: boolean; type: string };
	} ) => {
		const { value, checked, type, id } = event.target;
		const newContactDetails: DomainContactDetails = {};

		newContactDetails.extra = {
			ca: { [ camelCase( id ) ]: type === 'checkbox' ? checked : value },
		};

		this.props.onContactDetailsChange?.( { ...newContactDetails } );
	};

	getCiraAgreementAcceptedErrorMessage() {
		return (
			this.props.contactDetailsValidationErrors?.extra?.ca?.ciraAgreementAccepted ??
			this.props.translate( 'Required' )
		);
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
						onChange={ this.handleChangeEvent as any }
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
							<FormInputValidation text={ this.getCiraAgreementAcceptedErrorMessage() } isError />
						) }
					</FormLabel>
				</FormFieldset>
			</form>
		);
	}
}

export default connect( ( state ) => {
	return {
		userWpcomLang: getCurrentUserLocale( state ),
	};
} )( localize( RegistrantExtraInfoCaForm ) );
