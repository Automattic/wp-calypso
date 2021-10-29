import config from '@automattic/calypso-config';
import { get } from 'lodash';
import { useSelector } from 'react-redux';
import { getCurrentQueryArguments } from 'calypso/state/selectors/get-current-query-arguments';

export interface HomeLayoutQueryParams {
	dev?: true;
	view?: string;
}

export function useHomeLayoutQueryParams(): HomeLayoutQueryParams {
	const dev = get( useSelector( getCurrentQueryArguments ), 'dev', undefined );
	const view = get( useSelector( getCurrentQueryArguments ), 'view', undefined );

	return {
		dev: dev === 'true' || ( ! dev && config.isEnabled( 'home/layout-dev' ) ) || undefined,
		view,
	};
}
