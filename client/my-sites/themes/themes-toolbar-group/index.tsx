import { ResponsiveToolbarGroup } from '@automattic/components';
import { useEffect, useState } from 'react';
import type { ThemesToolbarGroupItem } from './types';
import './style.scss';

interface ThemesToolbarGroupProps {
	items: ThemesToolbarGroupItem[];
	selectedKey: string | null;
	onSelect: ( selectedSlug: string | null ) => void;
}

const ThemeToolbarGroup: React.FC< ThemesToolbarGroupProps > = ( {
	items,
	selectedKey,
	onSelect,
} ) => {
	const [ activeIndex, setActiveIndex ] = useState< number >( 0 );
	useEffect( () => {
		const selectedKeyIndex = items.findIndex( ( { key } ) => key === selectedKey );
		setActiveIndex( Math.max( selectedKeyIndex, 0 ) );
	}, [ items, selectedKey ] );

	return (
		<ResponsiveToolbarGroup
			className="themes-toolbar-group"
			initialActiveIndex={ activeIndex }
			onClick={ ( index: number ) => onSelect( items[ index ]?.key ) }
		>
			{ items.map( ( item ) => (
				<span key={ `themes-toolbar-group-item-${ item.key }` }>{ item.text }</span>
			) ) }
		</ResponsiveToolbarGroup>
	);
};

export default ThemeToolbarGroup;
