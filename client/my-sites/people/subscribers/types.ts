import type { Member, UseQuery } from '../types';

export type FollowersQueryData = {
	followers: Member[];
	total: number;
};

export type FollowersQuery = {
	data?: FollowersQueryData;
} & UseQuery;
