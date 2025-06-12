import React from 'react';
import { SectionHeaderProps } from '../section-header/types';

export interface PageHeaderProps extends Omit< SectionHeaderProps, 'level' | 'prefix' > {
	/**
	 * An optional breadcrumbs component used to indicate the user's current position
	 * in a complex navigational structure and allow quick access to parent levels.
	 */
	breadcrumbs?: React.ReactNode;
}
