import type { Member, UseQuery } from '@automattic/data-stores';

export type FollowersQueryData = {
	followers: Member[];
	total: number;
};

export type FollowersQuery = {
	data?: FollowersQueryData;
} & UseQuery;
