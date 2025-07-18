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
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const itemsArray = useMemo( () => Object.values( items ), Object.keys( items ) );

	const activeIndex = useMemo( () => {
		const index = itemsArray.findIndex( ( { key } ) => key === selectedKey );
		// If the selected key is not found, return undefined to disable the active state.
		return index >= 0 ? index : undefined;
	}, [ itemsArray, selectedKey ] );

	return (
		<ResponsiveToolbarGroup
			className="themes-toolbar-group"
			initialActiveIndex={ activeIndex }
			forceSwipe={ 'undefined' === typeof window }
			onClick={ ( index: number ) => onSelect( itemsArray[ index ]?.key ) }
			swipeEnabled={ false }
		>
			{ itemsArray.map( ( item ) => (
				<span key={ `themes-toolbar-group-item-${ item.key }` }>{ item.text }</span>
			) ) }
		</ResponsiveToolbarGroup>
	);
};

export default ThemesToolbarGroup;
