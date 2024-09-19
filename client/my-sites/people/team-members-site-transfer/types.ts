import type { Member, UseQuery } from '@automattic/data-stores';

export type UsersQueryData = {
	users: Member[];
	total: number;
};

export type UsersQuery = {
	data?: UsersQueryData;
} & UseQuery;
