import { UrlData } from 'calypso/blocks/import/types';
import type { SiteDetails } from '@automattic/data-stores';

export type Importer = 'blogger' | 'medium' | 'squarespace' | 'wix' | 'wordpress';
export type QueryObject = {
	from: string;
	to: string;
};

export type StepNavigator = {
	flow: string | null;
	supportLinkModal?: boolean;
	goToIntentPage?: () => void;
	goToGoalsPage?: () => void;
	goToImportCapturePage?: () => void;
	goToImportContentOnlyPage?: () => void;
	goToAdmin?: () => void;
	goToDashboardPage?: () => void;
	goToCheckoutPage?: ( queryArgs?: object ) => void;
	goToWpAdminImportPage?: () => void;
	goToWpAdminWordPressPluginPage?: () => void;
	navigate?: ( path: string ) => void;
	goToAddDomainPage?: () => void;
	goToSitePickerPage?: () => void;
	goToVerifyEmailPage?: () => void;
};

export interface ImportError {
	error: boolean;
	errorType: string;
	errorMessage: string;
}

export interface ImportJob {
	importerId: string;
	importerState: string;
	importerFileType: 'content' | 'playground' | 'jetpack_backup';
	statusMessage?: string;
	type: string;
	site: { ID: number };
	customData: {
		[ key: string ]: any;
		current_step?:
			| 'convert_to_atomic'
			| 'download_archive'
			| 'unpack_file'
			| 'preprocess'
			| 'process_files'
			| 'recreate_database'
			| 'postprocess_database'
			| 'verify_site_integrity'
			| 'clean_up';
	};
	errorData: {
		type: string;
		description: string;
		code?: string;
	};
	progress: ImportJobProgress;
}

export interface ImportJobProgress {
	page: { completed: number; total: number };
	post: { completed: number; total: number };
	comment: { completed: number; total: number };
	attachment: { completed: number; total: number };
	steps: { completed: number; total: number };
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
	site: SiteDetails;
	siteSlug: string;
	fromSite: string;
	urlData?: UrlData;
	importSite: ( params: ImportJobParams ) => void;
	startImport: ( siteId: number, type: string ) => void;
	resetImport: ( siteId: number, importerId: string ) => void;
	stepNavigator?: StepNavigator;
}
