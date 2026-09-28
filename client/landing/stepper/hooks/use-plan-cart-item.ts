import { useSelect } from '@wordpress/data';
import { ONBOARD_STORE } from '../stores';
import type { OnboardSelect } from '@automattic/data-stores';

export const usePlanCartItem = () =>
	useSelect( ( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getPlanCartItem(), [] );
