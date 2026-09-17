import type { Product } from '@automattic/api-core';

export const getTrialMonths = ( product?: Product ) =>
	product?.introductory_offer?.interval_unit === 'year' ? 12 : 3;
