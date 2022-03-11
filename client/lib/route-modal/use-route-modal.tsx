import { addQueryArgs, removeQueryArgs } from '@wordpress/url';
import page from 'page';
import { useSelector } from 'react-redux';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';

export interface RouteModalData {
	/** Whether the query key exists or not */
	isModalOpen: boolean;
	/** The value of query key */
	value: unknown;
	/** Set the query key to value */
	openModal: ( currentValue?: unknown ) => void;
	/** Clears the query key */
	closeModal: () => void;
}

/**
 * React hook providing utils to control opening and closing modal via query string.
 */
const useRouteModal = ( queryKey: string, defaultValue: unknown = '' ): RouteModalData => {
	const currentQuery = useSelector( getCurrentQueryArguments );
	const previousRoute = useSelector( getPreviousRoute );

	const value = currentQuery?.[ queryKey ];

	const isModalOpen = value != null;

	const openModal = ( currentValue: unknown = defaultValue ) => {
		const url = window.location.href.replace( window.location.origin, '' );
		const queryParams = {
			[ queryKey ]: currentValue,
		};

		page( addQueryArgs( url, queryParams ) );
	};

	const closeModal = () => {
		page( removeQueryArgs( previousRoute, queryKey ) );
	};

	return { isModalOpen, value, openModal, closeModal };
};

export default useRouteModal;
