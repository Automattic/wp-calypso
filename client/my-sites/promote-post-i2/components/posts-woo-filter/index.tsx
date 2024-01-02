import { useTranslate } from 'i18n-calypso';
import { useRef } from 'react';
import SegmentedControl from 'calypso/components/segmented-control';

export type WooItemsFilterType = 'products' | 'postsandpages';

interface Props {
	itemsFilter: WooItemsFilterType;
	handleChangeFilter: ( type: WooItemsFilterType ) => void;
}

export default function WooItemsFilter( props: Props ) {
	const translate = useTranslate();

	// Smooth horizontal scrolling on mobile views
	const tabsRef = useRef< { [ key: string ]: HTMLSpanElement | null } >( {} );
	const onTabClick = ( key: string ) => {
		tabsRef.current[ key ]?.scrollIntoView( {
			behavior: 'smooth',
			block: 'nearest',
			inline: 'center',
		} );
	};

	const { handleChangeFilter, itemsFilter } = props;

	const handleChange = ( type: WooItemsFilterType ) => {
		onTabClick( type );
		handleChangeFilter( type );
	};

	const options = [
		{
			value: 'products',
			label: translate( 'Products' ),
		},
		{
			value: 'postsandpages',
			label: translate( 'Posts & Pages' ),
		},
	];

	return (
		<SegmentedControl compact primary>
			{ options.map( ( option ) => (
				<SegmentedControl.Item
					key={ option.value }
					selected={ itemsFilter === option.value }
					onClick={ () => handleChange( option.value as WooItemsFilterType ) }
				>
					<span ref={ ( el ) => ( tabsRef.current[ option.value ] = el ) }> { option.label } </span>
				</SegmentedControl.Item>
			) ) }
		</SegmentedControl>
	);
}
