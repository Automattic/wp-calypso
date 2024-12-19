import config from '@automattic/calypso-config';

const wpcomEnvironments = [ 'development', 'stage', 'horizon', 'production' ];

const isWPCOMEnvironment = (): boolean => wpcomEnvironments.includes( config( 'env_id' ) );

export default isWPCOMEnvironment;
