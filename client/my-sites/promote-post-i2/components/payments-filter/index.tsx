import { SegmentedControl } from '@automattic/components';
import { useRef } from 'react';
import { DropdownOption } from '../search-bar';

export type PaymentsFilterType = 'unified' | 'currentSite';

interface Props {
	options: DropdownOption[];
	paymentsFilter: PaymentsFilterType;
	handleChangeFilter: ( flag: boolean ) => void;
}

export default function PaymentsFilter( props: Props ) {
	const tabsRef = useRef< { [ key: string ]: HTMLSpanElement | null } >( {} );
	const onTabClick = ( key: string ) => {
		tabsRef.current[ key ]?.scrollIntoView( {
			behavior: 'smooth',
			block: 'nearest',
			inline: 'center',
		} );
	};

	const { handleChangeFilter, paymentsFilter, options } = props;

	const handleChange = ( type: PaymentsFilterType ) => {
		onTabClick( type );
		handleChangeFilter( type === 'currentSite' );
	};

	return (
		<div className="promote-post-i2__search-bar-wrapper payments">
			<SegmentedControl compact primary>
				{ options.map( ( option ) => (
					<SegmentedControl.Item
						key={ option.value }
						selected={ paymentsFilter === option.value }
						onClick={ () => handleChange( option.value as PaymentsFilterType ) }
					>
						<span ref={ ( el ) => ( tabsRef.current[ option.value ] = el ) }>{ option.label }</span>
					</SegmentedControl.Item>
				) ) }
			</SegmentedControl>
		</div>
	);
}
