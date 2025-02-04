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
	const activeIndex = useMemo( () => {
		const index = items.findIndex( ( { key } ) => key === selectedKey );
		// If the selected key is not found, return undefined to disable the active state.
		return index >= 0 ? index : undefined;
	}, [ items, selectedKey ] );

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
