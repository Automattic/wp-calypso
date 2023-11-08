import { UseMutationOptions } from '@tanstack/react-query';

export type ProfileLink = {
	link_slug: string;
	title: string;
	value: string;
};

export type AddProfileLinksPayload = Pick< ProfileLink, 'title' | 'value' >[];

export type AddProfileLinksResponse = {
	added: ProfileLink[] | false;
	malformed: ProfileLink[] | false;
	duplicate: ProfileLink[] | false;
	profile_links: ProfileLink[];
};

export type AddProfileLinksVariables = {
	links: AddProfileLinksPayload;
};

export type AddProfileLinksMutationOptions = UseMutationOptions<
	AddProfileLinksResponse,
	Error,
	AddProfileLinksVariables,
	unknown
>;

export type ProfileLinkResponse = ProfileLink[];
