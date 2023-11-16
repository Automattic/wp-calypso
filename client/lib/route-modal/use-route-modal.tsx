import { removeQueryArgs } from '@wordpress/url';
import page from 'page';
import { addQueryArgs } from 'calypso/lib/url';
import { useSelector } from 'calypso/state';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';

export interface RouteModalData {
	/** Whether the query key exists or not */
	isModalOpen: boolean;
	/** The value of query key */
	value: unknown;
	/** Set the query key to value */
	openModal: ( currentValue?: string ) => void;
	/** Clears the query key */
	closeModal: () => void;
}

/**
 * React hook providing utils to control opening and closing modal via query string.
 * @param queryKey The key from the query string to control the modal.
 * @param targetValue If specified, the modal shows only when the value from the query string equals to it.
 */
const useRouteModal = ( queryKey: string, targetValue = '' ): RouteModalData => {
	const currentQuery = useSelector( getCurrentQueryArguments );
	const previousRoute = useSelector( getPreviousRoute );

	const value = currentQuery?.[ queryKey ];

	const isModalOpen = value != null && ( ! targetValue || value === targetValue );

	const openModal = ( currentValue: string = targetValue ) => {
		const url = window.location.href.replace( window.location.origin, '' );
		const queryParams = {
			[ queryKey ]: currentValue,
		};

		// Note: addQueryArgs in wordpress/url has a bug which means we cannot use
		// it. See https://github.com/Automattic/wp-calypso/issues/63185
		page( addQueryArgs( queryParams, url ) );
	};

	const closeModal = () => {
		page( removeQueryArgs( previousRoute, queryKey ) );
	};

	return { isModalOpen, value, openModal, closeModal };
};

export default useRouteModal;
