import { PageHeaderProps } from '../page-header/types';

export interface RouterPageHeaderProps extends Omit< PageHeaderProps, 'title' > {
	/**
	 * The main heading text that identifies the page or section.
	 * If not specified, the default is from the meta property of the last matched route.
	 */
	title?: React.ReactNode;
}
