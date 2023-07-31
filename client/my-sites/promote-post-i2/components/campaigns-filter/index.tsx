import { useTranslate } from 'i18n-calypso';
import { useRef } from 'react';
import SegmentedControl from 'calypso/components/segmented-control';

export type CampaignsFilterType = '' | 'active' | 'created' | 'finished' | 'rejected';

interface Props {
	campaignsFilter: CampaignsFilterType;
	handleChangeFilter: ( type: CampaignsFilterType ) => void;
}

export default function CampaignsFilter( props: Props ) {
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

	const { handleChangeFilter, campaignsFilter } = props;

	const handleChange = ( type: CampaignsFilterType ) => {
		onTabClick( type );
		handleChangeFilter( type );
	};

	const options = [
		{
			value: '',
			label: translate( 'All' ),
		},
		{
			value: 'active',
			label: translate( 'Active', { context: 'comment status' } ),
		},
		{
			value: 'created',
			label: translate( 'In moderation', { context: 'comment status' } ),
		},
		{
			value: 'finished',
			label: translate( 'Completed', { context: 'comment status' } ),
		},
		{
			value: 'rejected',
			label: translate( 'Rejected', { context: 'comment status' } ),
		},
	];

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
