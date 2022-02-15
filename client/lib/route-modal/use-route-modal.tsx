import { addQueryArgs, removeQueryArgs } from '@wordpress/url';
import page from 'page';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route.js';

type Params = { [ key: string ]: any };

interface ReturnValues {
	/** The values from query string and the properties are defined by queries argument */
	params: Params;
	openModal: ( queryArgs: Params ) => void;
	closeModal: () => void;
}

/**
 * React hook providing utils to control opening and closing modal via query string.
 */
const useRouteModal = ( ...queries: string[] ): ReturnValues => {
	const { currentQuery, previousRoute } = useSelector( ( state ) => ( {
		currentQuery: getCurrentQueryArguments( state ),
		previousRoute: getPreviousRoute( state ),
	} ) );

	const params = useMemo( () => {
		const results: Params = {};

		queries.forEach( ( key ) => {
			if ( currentQuery?.hasOwnProperty( key ) ) {
				results[ key ] = currentQuery[ key ];
			}
		} );

		return results;
	}, [ currentQuery, queries ] );

	const openModal = ( currentParams: Params ) => {
		const url = window.location.href.replace( window.location.origin, '' );
		const defaultParams = queries.reduce(
			( acc, cur ) => ( {
				...acc,
				[ cur ]: '',
			} ),
			{}
		);

		page(
			addQueryArgs( url, {
				...defaultParams,
				...currentParams,
			} )
		);
	};

	const closeModal = () => {
		page( removeQueryArgs( previousRoute, ...queries ) );
	};

	return { params, openModal, closeModal };
};

export default useRouteModal;
