import { SectionHeaderProps } from '../section-header/types';

export interface PageHeaderProps
	extends Omit< SectionHeaderProps, 'level' | 'title' | 'headingSuffix' > {
	/**
	 * The main heading text that identifies the page or section.
	 * If not specified, the default is from the meta property of the last matched route.
	 */
	title?: React.ReactNode;
	/**
	 * An optional overflow menu (e.g. a three-dot DropdownMenu) anchored to the
	 * top-right of the page header, outside the wrapping action area.
	 */
	overflowMenu?: React.ReactNode;
}
