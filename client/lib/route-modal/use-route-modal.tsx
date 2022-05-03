import { removeQueryArgs } from '@wordpress/url';
import page from 'page';
import { useSelector } from 'react-redux';
import { addQueryArgs } from 'calypso/lib/url';
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
 */
const useRouteModal = ( queryKey: string, defaultValue = '' ): RouteModalData => {
	const currentQuery = useSelector( getCurrentQueryArguments );
	const previousRoute = useSelector( getPreviousRoute );

	const value = currentQuery?.[ queryKey ];

	const isModalOpen = value != null;

	const openModal = ( currentValue: string = defaultValue ) => {
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
