import { fetchProfile, updateProfile } from '../../data/me-profile';
import { queryClient } from '../query-client';
import type { UserProfile } from '../../data/me-profile';

export const profileQuery = () => ( {
	queryKey: [ 'me', 'profile' ],
	queryFn: fetchProfile,
} );

export const profileMutation = () => ( {
	mutationFn: updateProfile,
	onSuccess: ( newData: Partial< UserProfile > ) => {
		queryClient.setQueryData( profileQuery().queryKey, ( oldData: UserProfile | undefined ) =>
			oldData ? { ...oldData, ...newData } : newData
		);
	},
} );
