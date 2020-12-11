/**
 * Internal dependencies
 */
import {
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_REALTIME,
} from 'calypso/lib/plans/constants';
import { slugToSelectorProduct } from '../utils';

/**
 * Type dependencies
 */
import type { SelectorProduct } from '../types';

export const getPlansToDisplay = (): SelectorProduct[] =>
	[ PLAN_JETPACK_SECURITY_DAILY, PLAN_JETPACK_SECURITY_REALTIME ].map(
		slugToSelectorProduct
	) as SelectorProduct[];
