import { ResponsiveToolbarGroup } from '@automattic/components';
import { useMemo } from 'react';
import type { ThemesToolbarGroupItem } from './types';
import './style.scss';

interface ThemesToolbarGroupProps {
	items: ThemesToolbarGroupItem[];
	selectedKey: string | null;
	onSelect: ( selectedSlug: string | null ) => void;
}

const ThemesToolbarGroup: React.FC< ThemesToolbarGroupProps > = ( {
	items,
	selectedKey,
	onSelect,
} ) => {
	const activeIndex = useMemo(
		() =>
			Math.max(
				items.findIndex( ( { key } ) => key === selectedKey ),
				0
			),
		[ items, selectedKey ]
	);

	return (
		<ResponsiveToolbarGroup
			className="themes-toolbar-group"
			initialActiveIndex={ activeIndex }
			forceSwipe={ 'undefined' === typeof window }
			onClick={ ( index: number ) => onSelect( items[ index ]?.key ) }
			swipeEnabled={ false }
		>
			{ items.map( ( item ) => (
				<span key={ `themes-toolbar-group-item-${ item.key }` }>{ item.text }</span>
			) ) }
		</ResponsiveToolbarGroup>
	);
};

export default ThemesToolbarGroup;
