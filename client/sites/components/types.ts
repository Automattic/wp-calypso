import type { SiteExcerptData } from '@automattic/sites';

export type SitePreviewPane = {
	open: (
		site: Pick< SiteExcerptData, 'ID' | 'slug' >,
		source: 'site_field' | 'action' | 'list_row_click' | 'environment_switcher',
		openInNewTab?: boolean
	) => void;
	getUrl: ( site: Pick< SiteExcerptData, 'slug' > ) => string;
};
