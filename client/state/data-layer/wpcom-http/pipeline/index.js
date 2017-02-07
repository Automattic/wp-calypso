/**
 * Internal dependencies
 */
import removeDuplicateGets from './remove-duplicate-gets';

const ingressChain = [
	removeDuplicateGets,
];

const egressChain = [

];

const applyIngressChain = ( { action, dispatch }, nextLink ) =>
	action !== null
		? nextLink( { action, dispatch } )
		: { action, dispatch };

const applyEgressChain = ( { error: rawError, data: rawData, action, dispatch, shouldAbort: shouldHaveAborted }, nextLink ) => {
	if ( true === shouldHaveAborted ) {
		return { error: rawError, data: rawData, action, dispatch, shouldHaveAborted };
	}

	const { error, data, shouldAbort } = nextLink( rawError, rawData, { action, dispatch } );

	return { error, data, action, dispatch, shouldAbort };
};

export const processIngressChain = chain => ( action, dispatch ) =>
	chain
		.reduce( applyIngressChain, { action, dispatch, shouldAbort: false } )
		.action;

export const processEgressChain = chain => ( { rawError, rawData, action, dispatch } ) => {
	const { error, data, shouldAbort } = chain.reduce(
		applyEgressChain,
		{ error: rawError, data: rawData, action, dispatch, shouldAbort: false },
	);

	return { error, data, shouldAbort };
};

export const processIngress = processIngressChain( ingressChain );

export const processEgress = processEgressChain( egressChain );
