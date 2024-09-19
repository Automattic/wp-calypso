import { GlobalStyles } from '../site';
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

export type DomainTransferNames = Record< string, string >;

export type DomainTransferAuthCodes = Record<
	string,
	{
		auth: string;
		valid: boolean;
		rawPrice: number;
		saleCost?: number;
		currencyCode: string | undefined;
	}
>;

export type DomainTransferData = Record<
	string,
	{
		domain: string;
		auth: string;
		valid: boolean;
		rawPrice: number;
		saleCost?: number;
		currencyCode?: string;
	}
>;

export type DomainTransferForm = {
	domains: DomainTransferData;
};

type ReadymadeTemplatePattern = {
	id: number;
	source_site_sid: number;
};
type ReadymadeTemplateStyles = {
	colors?: string;
	typography?: string;
};

export type ReadymadeTemplate = {
	template_id: number;
	slug: string;
	title: string;
	description: string;
	home: {
		header: string;
		content: string;
		footer: string;
	};
	patterns: ReadymadeTemplatePattern[];
	styles: ReadymadeTemplateStyles;
	globalStyles?: GlobalStyles;
	previewUrl: string;
};
