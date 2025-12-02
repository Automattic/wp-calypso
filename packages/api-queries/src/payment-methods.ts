import { createPayPalAgreement } from '@automattic/api-core';
import { mutationOptions } from '@tanstack/react-query';
import type { CreatePayPalAgreementParams } from '@automattic/api-core';

export const createPayPalAgreementMutation = () =>
	mutationOptions( {
		mutationFn: ( params: CreatePayPalAgreementParams ) => createPayPalAgreement( params ),
	} );
