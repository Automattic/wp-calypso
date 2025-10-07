import { SectionHeaderProps } from '../section-header/types';

export interface PageHeaderProps extends Omit< SectionHeaderProps, 'level' | 'title' > {
	/**
	 * The main heading text that identifies the page or section.
	 * If not specified, the default is from the meta property of the last matched route.
	 */
	title?: React.ReactNode;
}
