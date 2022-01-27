import { UrlData } from '../import/types';
import type { SitesItem } from 'calypso/state/selectors/get-sites-items';

export type Importer = 'blogger' | 'medium' | 'squarespace' | 'wix' | 'wordpress';
export type QueryObject = {
	from: string;
	to: string;
};

export interface ImportJob {
	importerId: string;
	importerState: string;
	statusMessage?: string;
	type: string;
	site: { ID: number };
	customData: { [ key: string ]: any };
	errorData: {
		type: string;
		description: string;
	};
	progress: {
		page: { completed: number; total: number };
		post: { completed: number; total: number };
		comment: { completed: number; total: number };
		attachment: { completed: number; total: number };
	};
}

export interface ImportJobParams {
	engine: Importer;
	importerStatus: ImportJob;
	params: { engine: Importer };
	site: { ID: number };
	targetSiteUrl: string;
	supportedContent: string[];
	unsupportedContent: string[];
}

export interface ImporterBaseProps {
	job?: ImportJob;
	run: boolean;
	siteId: number;
	site: SitesItem;
	siteSlug: string;
	fromSite: string;
	urlData: UrlData;
	importSite: ( params: ImportJobParams ) => void;
	startImport: ( siteId: number, type: string ) => void;
	resetImport: ( siteId: number, importerId: string ) => void;
}
