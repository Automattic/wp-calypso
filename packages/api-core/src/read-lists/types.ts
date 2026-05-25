export interface ReadList {
	ID: number;
	title: string;
	slug: string;
	description: string;
	owner: string;
	is_owner: boolean;
	is_public: boolean;
	is_immutable?: boolean;
}

export interface ReadSubscribedListsResponse {
	lists: ReadList[];
}

export interface ReadUserListsResponse {
	lists: ReadList[];
}

export interface ReadListResponse {
	list: ReadList;
}

export interface CreateReadListParams {
	title: string;
	description?: string;
	is_public?: boolean;
}

export interface UpdateReadListParams {
	title: string;
	slug: string;
	owner: string;
	description?: string;
	is_public?: boolean;
}
