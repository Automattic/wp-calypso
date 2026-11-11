import { FormInputValidation, FormLabel } from '@automattic/components';
import { camelCase, isEmpty, pick } from '@automattic/js-utils';
import { LocalizeProps, TranslateResult, localize } from 'i18n-calypso';
import { PureComponent } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import Notice from 'calypso/components/notice';
import RedEsAgreement from './red-es-agreement';
import type { DomainContactDetails } from '@automattic/shopping-cart';
import type {
	DomainContactDetailsErrors,
	EsDomainContactExtraDetailsErrors,
} from '@automattic/wpcom-checkout';
import type { ChangeEvent, ReactNode } from 'react';

import './style.scss';

const INDIVIDUAL_ENTITY_TYPE = '1';

const defaultValues = {
	redEsAgreementAccepted: false,
};

// Red.es only accepts NIF, NIE and CIF in upper case; foreign IDs are unaffected.
const UPPERCASED_FIELD_IDS = [ 'registrant-identification-number', 'admin-identification-number' ];

export interface FormProps {
	contactDetails: Record< string, unknown >;
	ccTldDetails: Record< string, unknown >;
	onContactDetailsChange?: ( payload: DomainContactDetails ) => void;
	contactDetailsValidationErrors: DomainContactDetailsErrors;
	domainNames?: string[];
	isVisible?: boolean;
	onSubmit?: () => void;
}

export class RegistrantExtraInfoEsForm extends PureComponent< FormProps & LocalizeProps > {
	entityTypeOptions: ReactNode[];

	constructor( props: FormProps & LocalizeProps ) {
		super( props );
		const { translate } = props;
		// The Red.es legal form codes accepted by the registry. "1" is the
		// individual; every other code is an organization.
		const organizationEntityTypes: Record< string, TranslateResult > = {
			39: translate( 'Economic Interest Group' ),
			47: translate( 'Association' ),
			59: translate( 'Sports Association' ),
			68: translate( 'Professional Association' ),
			124: translate( 'Savings Bank' ),
			150: translate( 'Community Property' ),
			152: translate( 'Community of Owners' ),
			164: translate( 'Order or Religious Institution' ),
			181: translate( 'Consulate' ),
			197: translate( 'Public Law Association' ),
			203: translate( 'Embassy' ),
			229: translate( 'Local Authority' ),
			269: translate( 'Sports Federation' ),
			286: translate( 'Foundation' ),
			365: translate( 'Mutual Insurance Company' ),
			434: translate( 'Regional Government Body' ),
			436: translate( 'Central Government Body' ),
			439: translate( 'Political Party' ),
			476: translate( 'Trade Union' ),
			510: translate( 'Farm Partnership' ),
			524: translate( 'Public Limited Company' ),
			525: translate( 'Sports Public Limited Company (Sociedad Anónima Deportiva)' ),
			554: translate( 'Civil Society' ),
			560: translate( 'General Partnership' ),
			562: translate( 'General and Limited Partnership' ),
			566: translate( 'Cooperative' ),
			608: translate( 'Worker-owned Company' ),
			612: translate( 'Limited Company' ),
			713: translate( 'Spanish Office of a Foreign Company' ),
			717: translate( 'Temporary Alliance of Enterprises' ),
			744: translate( 'Worker-owned Limited Company' ),
			745: translate( 'Regional Public Entity' ),
			746: translate( 'National Public Entity' ),
			747: translate( 'Local Public Entity' ),
			877: translate( 'Other' ),
			878: translate( 'Designation of Origin Supervisory Council' ),
			879: translate( 'Entity Managing Natural Areas' ),
		};
		const sortedOrganizationEntityTypes = Object.entries( organizationEntityTypes ).sort(
			( [ , a ], [ , b ] ) => String( a ).localeCompare( String( b ) )
		);
		this.entityTypeOptions = [
			<option value="" key="placeholder" disabled>
				{ translate( 'Select an option' ) }
			</option>,
			<option value={ INDIVIDUAL_ENTITY_TYPE } key={ INDIVIDUAL_ENTITY_TYPE }>
				{ translate( 'Individual' ) }
			</option>,
			...sortedOrganizationEntityTypes.map( ( [ optionValue, text ] ) => (
				<option value={ optionValue } key={ optionValue }>
					{ text }
				</option>
			) ),
		];
	}

	componentDidMount() {
		// Add defaults to the store to make accepting default values work.
		const providedDetails = Object.keys( this.props.ccTldDetails );
		const neededRequiredDetails = [ 'redEsAgreementAccepted' ].filter(
			( key ) => ! providedDetails.includes( key )
		);

		// Bail early as we already have the details from a previous purchase.
		if ( isEmpty( neededRequiredDetails ) ) {
			return;
		}

		const payload = {
			extra: {
				es: pick( defaultValues, neededRequiredDetails ),
			},
		};

		this.props.onContactDetailsChange?.( payload );
	}

	handleChangeEvent = ( event: ChangeEvent< HTMLInputElement | HTMLSelectElement > ) => {
		const { id, value } = event.target;
		const payload = {
			extra: {
				es: {
					[ camelCase( id ) ]: UPPERCASED_FIELD_IDS.includes( id ) ? value.toUpperCase() : value,
				},
			},
		};

		this.props.onContactDetailsChange?.( payload );
	};

	getFieldError( field: keyof EsDomainContactExtraDetailsErrors ) {
		return this.props.contactDetailsValidationErrors?.extra?.es?.[ field ];
	}

	renderFieldError( field: keyof EsDomainContactExtraDetailsErrors ) {
		const error = this.getFieldError( field );
		if ( ! error ) {
			return null;
		}
		return <FormInputValidation text={ error } isError />;
	}

	renderAdminIdentificationNumberField() {
		const { ccTldDetails, translate } = this.props;
		const adminIdentificationNumber = ( ccTldDetails?.adminIdentificationNumber as string ) ?? '';

		return (
			<FormFieldset>
				<FormLabel htmlFor="admin-identification-number">
					{ translate( 'Contact person identification number (NIF or NIE)' ) }
				</FormLabel>
				<FormTextInput
					id="admin-identification-number"
					value={ adminIdentificationNumber }
					autoCapitalize="characters"
					autoComplete="off"
					autoCorrect="off"
					onChange={ this.handleChangeEvent }
					isError={ Boolean( this.getFieldError( 'adminIdentificationNumber' ) ) }
				/>
				{ this.renderFieldError( 'adminIdentificationNumber' ) }
				<Notice
					status="is-info"
					showDismiss={ false }
					text={ translate(
						'Red.es requires the administrative and technical contact of a .es domain to be a person, not a company. We will register the contact person named above with this identification number. Red.es may publish some of these details.'
					) }
				/>
			</FormFieldset>
		);
	}

	render() {
		const {
			contactDetails,
			ccTldDetails,
			domainNames,
			onContactDetailsChange,
			contactDetailsValidationErrors,
			translate,
		} = this.props;
		const registrantEntityType = ( ccTldDetails?.registrantEntityType as string ) ?? '';
		const registrantIdentificationNumber =
			( ccTldDetails?.registrantIdentificationNumber as string ) ?? '';
		const isOrganization =
			Boolean( registrantEntityType ) && registrantEntityType !== INDIVIDUAL_ENTITY_TYPE;

		return (
			<form className="registrant-extra-info__form">
				<p className="registrant-extra-info__form-desciption">
					{ translate( 'Almost done! We need some extra details to register your %(tld)s domain.', {
						args: { tld: '.es' },
					} ) }
				</p>
				<FormFieldset>
					<FormLabel htmlFor="registrant-entity-type">
						{ translate( 'Choose the option that best describes the domain owner:' ) }
					</FormLabel>
					<FormSelect
						id="registrant-entity-type"
						value={ registrantEntityType }
						className="registrant-extra-info__form-registrant-entity-type"
						onChange={ this.handleChangeEvent }
					>
						{ this.entityTypeOptions }
					</FormSelect>
					{ this.renderFieldError( 'registrantEntityType' ) }
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="registrant-identification-number">
						{ translate( 'Domain owner identification number' ) }
					</FormLabel>
					<FormTextInput
						id="registrant-identification-number"
						value={ registrantIdentificationNumber }
						autoCapitalize="characters"
						autoComplete="off"
						autoCorrect="off"
						onChange={ this.handleChangeEvent }
						isError={ Boolean( this.getFieldError( 'registrantIdentificationNumber' ) ) }
					/>
					{ this.renderFieldError( 'registrantIdentificationNumber' ) }
					<FormSettingExplanation>
						{ translate(
							'For a person, enter their NIF or NIE. For a company, enter its CIF. Owners outside Spain can enter an equivalent national identification number.'
						) }
					</FormSettingExplanation>
				</FormFieldset>
				{ isOrganization && this.renderAdminIdentificationNumberField() }
				<RedEsAgreement
					contactDetails={ contactDetails }
					ccTldDetails={ ccTldDetails }
					domainNames={ domainNames ?? [] }
					onContactDetailsChange={ onContactDetailsChange }
					contactDetailsValidationErrors={ contactDetailsValidationErrors }
				/>
			</form>
		);
	}
}

export default localize( RegistrantExtraInfoEsForm );
