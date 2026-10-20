import { FormInputValidation, FormLabel } from '@automattic/components';
import { camelCase, pick, isEmpty } from '@automattic/js-utils';
import { LocalizeProps, localize } from 'i18n-calypso';
import { PureComponent, ReactNode } from 'react';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import type { DomainContactDetails } from '@automattic/shopping-cart';
import type { DomainContactDetailsErrors } from '@automattic/wpcom-checkout';

import './style.scss';

const defaultValues = {
	nexusDeclaration: false,
	nexusConnectionType: '',
};

export interface FormProps {
	contactDetails: Record< string, unknown >;
	ccTldDetails: Record< string, unknown >;
	onContactDetailsChange?: ( payload: DomainContactDetails ) => void;
	contactDetailsValidationErrors: DomainContactDetailsErrors;
	isVisible?: boolean;
	onSubmit?: () => void;
}

export class RegistrantExtraInfoInForm extends PureComponent< FormProps & LocalizeProps > {
	nexusConnectionTypeOptions: ReactNode[];

	constructor( props: FormProps & LocalizeProps ) {
		super( props );
		const { translate } = props;
		const nexusConnectionTypes = {
			ENTITY: translate( 'Indian Business Presence' ),
			COMM: translate( 'Commercial Activity in India' ),
			MKTG: translate( 'Marketing or Business Development Targeting India' ),
			CONTENT: translate( 'Content or Digital Services Targeting Indian Users' ),
			EDU: translate( 'Educational or Research Activities Involving India' ),
			CULTURE: translate( 'Cultural or Community Activities Connected to India' ),
			OTHER: translate( 'Other Business Purpose Connected to India' ),
		};
		this.nexusConnectionTypeOptions = [
			<option value="" key="placeholder" disabled>
				{ translate( 'Select an option' ) }
			</option>,
			...Object.entries( nexusConnectionTypes ).map( ( [ optionValue, text ] ) => (
				<option value={ optionValue } key={ optionValue }>
					{ text }
				</option>
			) ),
		];
	}

	componentDidMount() {
		if ( ! this.isForeignRegistrant() ) {
			return;
		}

		// Add defaults to the store to make accepting default values work.
		const providedDetails = Object.keys( this.props.ccTldDetails );
		const neededRequiredDetails = [ 'nexusDeclaration', 'nexusConnectionType' ].filter(
			( key ) => ! providedDetails.includes( key )
		);

		// Bail early as we already have the details from a previous purchase.
		if ( isEmpty( neededRequiredDetails ) ) {
			return;
		}

		const payload = {
			extra: {
				in: pick( defaultValues, neededRequiredDetails ),
			},
		};

		this.props.onContactDetailsChange?.( payload );
	}

	isForeignRegistrant() {
		const countryCode = this.props.contactDetails?.countryCode as string | undefined;
		return Boolean( countryCode ) && countryCode !== 'IN';
	}

	handleChangeEvent = ( event: {
		target: { id: string; value: string; checked: boolean; type: string };
	} ) => {
		const { value, checked, type, id } = event.target;
		const payload = {
			extra: {
				in: { [ camelCase( id ) ]: type === 'checkbox' ? checked : value },
			},
		};

		this.props.onContactDetailsChange?.( payload );
	};

	getNexusDeclarationErrorMessage() {
		return (
			this.props.contactDetailsValidationErrors?.extra?.in?.nexusDeclaration ??
			this.props.translate( 'Required' )
		);
	}

	renderNexusConnectionTypeErrors() {
		const nexusConnectionTypeErrors =
			this.props.contactDetailsValidationErrors?.extra?.in?.nexusConnectionType;
		if ( ! nexusConnectionTypeErrors ) {
			return null;
		}
		return <FormInputValidation text={ nexusConnectionTypeErrors } isError />;
	}

	render() {
		const { translate } = this.props;

		// The nexus declaration is only required when the registrant is not
		// providing an Indian address.
		if ( ! this.isForeignRegistrant() ) {
			return null;
		}

		const { nexusDeclaration, nexusConnectionType } = {
			...defaultValues,
			...this.props.ccTldDetails,
		};

		return (
			<form className="registrant-extra-info__form">
				<p className="registrant-extra-info__form-desciption">
					{ translate( 'Almost done! We need some extra details to register your %(tld)s domain.', {
						args: { tld: '.in' },
					} ) }
				</p>
				<FormFieldset>
					<FormLabel htmlFor="nexus-connection-type">
						{ translate( 'Choose the option that best describes your connection to India:' ) }
					</FormLabel>
					<FormSelect
						id="nexus-connection-type"
						value={ nexusConnectionType }
						className="registrant-extra-info__form-nexus-connection-type"
						onChange={ this.handleChangeEvent as any }
					>
						{ this.nexusConnectionTypeOptions }
					</FormSelect>
					{ this.renderNexusConnectionTypeErrors() }
				</FormFieldset>
				<FormFieldset>
					<FormLabel>
						<FormCheckbox
							id="nexus-declaration"
							checked={ Boolean( nexusDeclaration ) }
							onChange={ this.handleChangeEvent }
						/>
						<span>
							{ translate(
								'I declare that I have a bona fide legitimate connection to India and that the information provided is accurate.'
							) }
						</span>
						{ nexusDeclaration || (
							<FormInputValidation text={ this.getNexusDeclarationErrorMessage() } isError />
						) }
					</FormLabel>
				</FormFieldset>
			</form>
		);
	}
}

export default localize( RegistrantExtraInfoInForm );
