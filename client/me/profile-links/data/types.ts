import { UseMutationOptions } from '@tanstack/react-query';

export type ProfileLink = {
	link_slug: string;
	title: string;
	value: string;
};

export type AddProfileLinkPayload = Pick< ProfileLink, 'title' | 'value' >;

export type AddProfileLinksPayload = AddProfileLinkPayload[];

export type ProfileLinkResponse = ProfileLink[];

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
