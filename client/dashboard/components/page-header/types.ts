import { Item } from '@automattic/components/src/breadcrumbs/types';
import { SectionHeaderProps } from '../section-header/types';

export interface PageHeaderProps extends Omit< SectionHeaderProps, 'level' > {}

export interface SubNavigationProps {
	items: Item[];
}
