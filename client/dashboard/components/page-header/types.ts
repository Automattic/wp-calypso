import { SectionHeaderProps } from '../section-header/types';

export interface PageHeaderProps extends Omit< SectionHeaderProps, 'level' | 'title' > {
	/**
	 * The main heading text that identifies the page or section.
	 * If not specified, the default is the last matched route with a title meta.
	 */
	title?: React.ReactNode;
}
