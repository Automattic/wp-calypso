import config from '@automattic/calypso-config';

const a4aEnvironments = [
	'a8c-for-agencies-development',
	'a8c-for-agencies-stage',
	'a8c-for-agencies-horizon',
	'a8c-for-agencies-production',
];

const isA8CForAgencies = (): boolean => a4aEnvironments.includes( config( 'env_id' ) );

export default isA8CForAgencies;
