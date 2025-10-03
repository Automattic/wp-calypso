import type { ReferHostingFormData, FormFieldsConfig, ReferHostingFormDataPayload } from '../types';

const FIELD_NAME_MAPPING: Record< keyof ReferHostingFormData, keyof ReferHostingFormDataPayload > =
	{
		companyName: 'company_name',
		address: 'address',
		country: 'country_code',
		state: 'state',
		city: 'city',
		zip: 'zip',
		firstName: 'first_name',
		lastName: 'last_name',
		title: 'title',
		phone: 'phone',
		email: 'email',
		website: 'website',
		opportunityDescription: 'opportunity_description',
		leadType: 'lead_type',
		isRfp: 'is_rfp',
	};

export const getReferralFormData = (
	fieldsConfig: FormFieldsConfig = {},
	formData: ReferHostingFormData
): ReferHostingFormDataPayload => {
	return Object.entries( formData ).reduce( ( result, [ key, value ] ) => {
		// Include field unless explicitly disabled
		if ( fieldsConfig[ key ]?.enabled !== false ) {
			const backendFieldName = FIELD_NAME_MAPPING[ key as keyof ReferHostingFormData ];
			if ( backendFieldName ) {
				( result as Record< string, unknown > )[ backendFieldName ] = value;
			}
		}
		return result;
	}, {} as ReferHostingFormDataPayload );
};
