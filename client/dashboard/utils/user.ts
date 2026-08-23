import type { User, UserFlags } from '@automattic/api-core';

export const userHasFlag = ( user: User, flag: UserFlags ) => {
	return user.meta.data.flags?.active_flags.includes( flag );
};
