import type { Member, UseQuery } from '../types';

export type UsersQueryData = {
	users: Member[];
	total: number;
};

export type UsersQuery = {
	data?: UsersQueryData;
} & UseQuery;
