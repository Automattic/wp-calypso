import emailValidator from 'email-validator';
import { useMemo, useState } from 'react';
import { AgencyDetails } from 'calypso/a8c-for-agencies/sections/partner-directory/types';
import { isValidUrl } from '../../utils/tools';

type Props = {
	initialFormData?: AgencyDetails | null;
};

export default function useDetailsForm( { initialFormData }: Props ) {
	const [ formData, setFormData ] = useState< AgencyDetails >(
		initialFormData ?? {
			name: '',
			email: '',
			website: '',
			bioDescription: '',
			logoUrl: '',
			landingPageUrl: '',
			country: '',
			isAvailable: true,
			industries: [],
			languagesSpoken: [],
			budgetLowerRange: '0',
			services: [],
			products: [],
		}
	);

	const isValidFormData = useMemo(
		(): boolean =>
			formData.name.length > 0 &&
			formData.email.length > 0 &&
			emailValidator.validate( formData.email ) &&
			isValidUrl( formData.website ) &&
			formData.bioDescription.length > 0 &&
			isValidUrl( formData.logoUrl ) &&
			// landingPageUrl is optional
			( formData.landingPageUrl.length === 0 || isValidUrl( formData.landingPageUrl ) ) &&
			formData.country?.length > 0 &&
			formData.industries.length > 0 &&
			formData.services.length > 0 &&
			formData.products.length > 0 &&
			formData.languagesSpoken.length > 0,
		[ formData ]
	);

	return {
		formData,
		setFormData,
		isValidFormData,
	};
}
