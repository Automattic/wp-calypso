import type { DomainSuggestion } from '../domain-suggestions';

export type DomainForm = {
	lastQuery?: string;
	subdomainSearchResults?: DomainSuggestion[] | null;
	loadingResults?: boolean;
	searchResults?: DomainSuggestion[] | null;
	hideInitialQuery?: boolean;
};

export interface ProfilerData {
	[ key: string ]: string | number | boolean | string[] | number[];
}
