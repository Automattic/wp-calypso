import config from '@automattic/calypso-config';

const environments = [
	'a8c-for-hosts-development',
	'a8c-for-hosts-stage',
	'a8c-for-hosts-production',
];

const isA8CForHosts = (): boolean => environments.includes( config( 'env_id' ) );

export default isA8CForHosts;
