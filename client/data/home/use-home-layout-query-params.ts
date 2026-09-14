import config from '@automattic/calypso-config';
import { useSelector } from 'calypso/state';
import { getCurrentQueryArguments } from 'calypso/state/selectors/get-current-query-arguments';

export interface HomeLayoutQueryParams {
	dev?: true;
	view?: string;
}

type QueryArguments = Record< string, string | string[] > | null | undefined;

export function getHomeLayoutQueryParams( queryArguments: QueryArguments ): HomeLayoutQueryParams {
	const { dev, view } = queryArguments ?? {};

	return {
		dev: dev === 'true' || ( ! dev && config.isEnabled( 'home/layout-dev' ) ) || undefined,
		view: view?.toString(),
	};
}

export function useHomeLayoutQueryParams(): HomeLayoutQueryParams {
	return getHomeLayoutQueryParams( useSelector( getCurrentQueryArguments ) );
}
