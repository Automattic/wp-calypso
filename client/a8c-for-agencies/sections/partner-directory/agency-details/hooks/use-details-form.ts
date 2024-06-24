import { useMemo, useState } from 'react';
import { AgencyDetails } from 'calypso/a8c-for-agencies/sections/partner-directory/types';

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
			industry: '',
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
			formData.website.length > 0 &&
			formData.bioDescription.length > 0 &&
			formData.logoUrl.length > 0 &&
			formData.country?.length > 0 &&
			formData.industry.length > 0 &&
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
