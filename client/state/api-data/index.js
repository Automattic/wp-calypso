/** @format */
/**
 * External dependencies
 */
import { bindActionCreators, connect } from 'react-redux';
import { get, identity, mapValues } from 'lodash';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http as rawHttp } from 'state/http/actions';

export const dataTypes = {
	GEO: {
		fetch: () => rawHttp( { method: 'GET', url: 'https://public-api.wordpress.com/geo/' } ),
		dataPath: null,
	},
	POST: {
		fetch: ( { siteId, postId } ) =>
			http( { method: 'GET', apiVersion: '1.2', path: `/sites/${ siteId }/posts/${ postId }` } ),
		dataPath: ( { siteId, postId } ) => [ siteId, postId ],
	},
};

export const apiConnector = ( state, dispatch ) => ( apiType, id ) => {
	if ( ! dataTypes.hasOwnProperty( apiType ) ) {
		return null;
	}

	dispatch( { type: 'API_DATA_REQUEST', apiType, id } );

	const { dataPath } = dataTypes[ apiType ];

	return get( state, dataPath( id ) );
};

const isRequesting = state => ( type, id ) =>
	get( state, dataTypes[ type ].dataPath( id ) )[ 0 ] === 'fetching';

const didRequestFail = state => ( type, id ) =>
	get( state, dataTypes[ type ].dataPath( id ) )[ 0 ] === 'failure';

const lastUpdate = state => ( type, id ) => get( state, dataTypes[ type ].dataPath( id ) )[ 1 ];

export const connectWithApi = (
	mapStateToProps,
	mapDispatchToProps,
	mergeProps,
	options
) => Component => {
	const stateMapper = ( state, ownProps ) => ( {
		...mapStateToProps( state, ownProps ),
		stolenState: state,
	} );

	const dispatchMapper =
		'function' === typeof mapDispatchToProps
			? ( dispatch, ownProps ) =>
					Object.assign( {}, mapDispatchToProps( dispatch, ownProps ), {
						stolenDispatch: dispatch,
					} )
			: dispatch =>
					Object.assign( {}, bindActionCreators( mapDispatchToProps, dispatch ), {
						stolenDispatch: dispatch,
					} );

	const apiMapper = props => {
		const { stolenDispatch, stolenState, apiData } = props;

		const connector = apiConnector( stolenState, stolenDispatch );

		return mapValues( apiData, ( [ type, id ] ) => connector( type, id ) );
	};

	const propMerger = ( s, d, ownProps ) => {
		const { stolenState, ...stateProps } = s;
		const { stolenDispatch, ...dispatchProps } = d;

		const baseProps =
			'function' === typeof mergeProps
				? mergeProps( stateProps, dispatchProps, ownProps )
				: { ...ownProps, ...stateProps, ...dispatchProps };

		return {
			...baseProps,
			...apiMapper( stolenState, stolenDispatch, baseProps ),
			isRequesting: isRequesting( stolenState ),
			didRequestFail: didRequestFail( stolenState ),
			lastUpdate: lastUpdate( stolenState ),
		};
	};

	return connect( stateMapper, dispatchMapper, propMerger, options )( Component );
};

const itemReducer = ( state = null, { data, error, apiState } ) => {
	const [ , , oldData ] = state;

	switch ( apiState ) {
		case 'fetching':
			return [ 'fetching', Date.now() ];

		case 'success':
			return [ 'loaded', Date.now(), data ];

		case 'failure':
			return [ 'failed', Date.now(), oldData, error ];
	}

	return state;
};

const reducer = ( state = {}, { type, apiType, id, status, data, error, progress } ) => {
	if ( type !== 'API_DATA_UPDATE' ) {
		return state;
	}

	const { dataPath } = dataTypes[ apiType ];
	const path = dataPath( id );

	return update(
		state,
		path,
		itemReducer( get( state, path ), { status, data, error, progress } )
	);
};

const makeRequestHandler = () => {
	const fetcher = ( { dispatch, getState }, { apiType, id } ) => {
		const lastUpdated = lastUpdate( getState() )( apiType, id );
		const { fetch, fresherThan = Infinity } = dataTypes[ apiType ];

		const requestAction = { type: 'API_DATA_REQUEST', apiType, id };
		const HTTP_BASE = {
			onSuccess: requestAction,
			onFailure: requestAction,
			onProgress: requestAction,
		};

		if ( Date.now() - lastUpdated > fresherThan ) {
			dispatch( { ...fetch( id ), ...HTTP_BASE } );
		}
	};

	const onFailure = ( { dispatch }, { apiType }, error ) =>
		dispatch( { type: 'API_DATA_UPDATE', apiType, status: 'failure', error } );

	const onSuccess = ( store, action, data ) => {
		const { dispatch } = store;
		const { apiType } = action;
		const { fromApi = identity } = dataTypes[ apiType ];

		try {
			return dispatch( {
				type: 'API_DATA_UPDATE',
				apiType,
				status: 'success',
				data: fromApi( data ),
			} );
		} catch ( e ) {
			return onFailure( store, action, e );
		}
	};

	const onProgress = ( { dispatch }, { apiType }, progress ) =>
		dispatch( { type: 'API_DATA_UPDATE', apiType, status: 'progress', progress } );

	return dispatchRequest( fetcher, onSuccess, onFailure, { onProgress } );
};

export const middleware = {
	API_DATA_REQUEST: [ makeRequestHandler() ],
};
