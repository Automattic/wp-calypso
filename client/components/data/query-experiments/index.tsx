/**
 * External Dependencies
 */

import { useEffect, FunctionComponent } from 'react';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import { fetchExperiments } from 'state/data-layer/wpcom/experiments';
import { getAnonId, nextRefresh } from 'state/experiments/selectors';
import { AppState } from 'types';

type QueryProps = {
	doFetchExperiments: typeof fetchExperiments;
	updateAfter: number;
	anonId: string;
};

/**
 * Stolen from w.js.
 * In the case of a fresh page load, we absolutely need to get the user's anonid as quickly as possible.
 */
const getCookie = () => {
	const name_eq = encodeURIComponent( 'tk_ai' ) + '=';
	const name_eq_len = name_eq.length;
	let cookies = document.cookie.split( '; ' );
	let cookies_len = cookies.length;

	// In testing all browsers use `; ` as seperator but just in case for RFC also try `;`
	if ( cookies_len === 1 ) {
		cookies = document.cookie.split( ';' );
		cookies_len = cookies.length;
	}

	for ( cookies_len--; cookies_len >= 0; cookies_len-- ) {
		if ( cookies[ cookies_len ].substring( 0, name_eq_len ) === name_eq ) {
			return decodeURIComponent( cookies[ cookies_len ].substring( name_eq_len ) );
		}
	}

	return null;
};

const forceGetAnonId = () => {
	return new Promise( ( resolve ) => {
		const value = getCookie();
		if ( value !== null ) {
			resolve( value );
			return;
		}

		setTimeout( () => {
			// if we still don't have a anonid ... then, we can't wait forever.
			resolve( getCookie() );
		}, 10 );
	} );
};

const QueryExperiments: FunctionComponent< QueryProps > = ( {
	updateAfter,
	doFetchExperiments,
	anonId,
} ) => {
	useEffect( () => {
		if ( updateAfter < Date.now() ) {
			if ( anonId === null ) {
				forceGetAnonId().then( ( newId ) => doFetchExperiments( newId ) );
			} else {
				doFetchExperiments( anonId );
			}
		}
	}, [ updateAfter, doFetchExperiments, anonId ] );

	return null;
};

const mapStateToProps = ( state: AppState ) => ( {
	updateAfter: nextRefresh( state ),
	anonId: getAnonId( state ),
} );

export default connect( mapStateToProps, { doFetchExperiments: fetchExperiments } )(
	QueryExperiments
);
