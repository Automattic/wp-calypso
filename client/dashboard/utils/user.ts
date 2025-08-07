import type { User, UserFlags } from '../data/types';

export const userHasFlag = ( user: User, flag: UserFlags ) => {
	if ( ! user ) {
		return false;
	}
	return user.meta.data.flags.active_flags.includes( flag );
};
