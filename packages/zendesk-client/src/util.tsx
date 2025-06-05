import config from '@automattic/calypso-config';
import { isInSupportSession } from '@automattic/data-stores';

export const isTestModeEnvironment = () => {
	const currentEnvironment = config( 'env_id' ) as string;
	// During SU sessions, we want to always target prod. See HAL-154.
	return ! isInSupportSession() && ! [ 'production', 'desktop' ].includes( currentEnvironment );
};
