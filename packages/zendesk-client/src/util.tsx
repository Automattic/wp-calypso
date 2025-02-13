import config from '@automattic/calypso-config';

export const isTestModeEnvironment = () => {
	const currentEnvironment = config( 'env_id' ) as string;
	return ! [ 'production', 'desktop' ].includes( currentEnvironment );
};
