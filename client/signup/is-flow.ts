import config from '@automattic/calypso-config';

export const isReskinnedFlow = ( flowName: string ) => {
	return config< string[] >( 'reskinned_flows' ).includes( flowName );
};

export const isP2Flow = ( flowName: string ) => {
	return flowName === 'p2';
};

export const isWpccFlow = ( flowName: string ) => {
	return flowName === 'wpcc';
};
