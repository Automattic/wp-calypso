import { SegmentedControl } from '@automattic/components';
import { useRef } from 'react';
import { DropdownOption } from '../search-bar';

export type CampaignsFilterType = '' | 'active' | 'created' | 'finished' | 'rejected';

interface Props {
	campaignsFilter: CampaignsFilterType;
	handleChangeFilter: ( type: CampaignsFilterType ) => void;
	options: DropdownOption[];
}

export default function CampaignsFilter( props: Props ) {
	// Smooth horizontal scrolling on mobile views
	const tabsRef = useRef< { [ key: string ]: HTMLSpanElement | null } >( {} );
	const onTabClick = ( key: string ) => {
		tabsRef.current[ key ]?.scrollIntoView( {
			behavior: 'smooth',
			block: 'nearest',
			inline: 'center',
		} );
	};

	const { handleChangeFilter, campaignsFilter, options } = props;

	const handleChange = ( type: CampaignsFilterType ) => {
		onTabClick( type );
		handleChangeFilter( type );
	};

	return (
		<SegmentedControl compact primary>
			{ options.map( ( option ) => (
				<SegmentedControl.Item
					key={ option.value }
					selected={ campaignsFilter === option.value }
					onClick={ () => handleChange( option.value as CampaignsFilterType ) }
				>
					<span ref={ ( el ) => ( tabsRef.current[ option.value ] = el ) }>{ option.label }</span>
				</SegmentedControl.Item>
			) ) }
		</SegmentedControl>
	);
}
