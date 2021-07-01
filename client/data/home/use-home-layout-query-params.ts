/**
 * External dependencies
 */
import { useSelector } from 'react-redux';
import config from '@automattic/calypso-config';

/**
 * Internal dependencies
 */
import { getCurrentQueryArguments } from 'calypso/state/selectors/get-current-query-arguments';

export interface HomeLayoutQueryParams {
	dev?: true;
	view?: string;
}

export function useHomeLayoutQueryParams(): HomeLayoutQueryParams {
	const { dev, view } = useSelector( getCurrentQueryArguments ) as any;

	return {
		dev: dev === 'true' || ( ! dev && config.isEnabled( 'home/layout-dev' ) ) || undefined,
		view,
	};
}
