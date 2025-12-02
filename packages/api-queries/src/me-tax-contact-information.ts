import { validateTaxContactInformation } from '@automattic/api-core';
import { mutationOptions } from '@tanstack/react-query';
import type { ValidateTaxContactInfoParams } from '@automattic/api-core';

export const validateTaxContactInformationMutation = () =>
	mutationOptions( {
		mutationFn: ( params: ValidateTaxContactInfoParams ) => validateTaxContactInformation( params ),
	} );
