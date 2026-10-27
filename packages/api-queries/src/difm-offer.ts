import { sendDifmOfferBuildRequest } from '@automattic/api-core';
import { mutationOptions } from '@tanstack/react-query';
import type { DifmOfferBuildRequest } from '@automattic/api-core';

export const difmOfferBuildRequestMutation = ( siteId: number ) =>
	mutationOptions( {
		meta: { statId: 'difm-offer-build-request' },
		mutationFn: ( data: DifmOfferBuildRequest ) => sendDifmOfferBuildRequest( siteId, data ),
	} );
