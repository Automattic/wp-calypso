import { SegmentedControl, SelectDropdown } from '@automattic/components';
import { useMediaQuery } from '@wordpress/compose';
import { translate } from 'i18n-calypso';
import React, { useRef } from 'react';
import { DropdownOption } from '../search-bar';
import './style.scss';

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

	const onChangePaymentFilterDropdown = ( option: string ) => {
		handleChangeFilter( option === 'currentSite' );
	};

	const isDesktop = useMediaQuery( '(min-width: 1300px)' );

	const handleChange = ( type: PaymentsFilterType ) => {
		onTabClick( type );
		handleChangeFilter( type === 'currentSite' );
	};

	const getPaymentFilterLabel = () => {
		const selectedOption = options.find( ( item ) => item.value === paymentsFilter )?.label;
		return selectedOption
			? // translators: filterOption is something like All sites, Current site
			  translate( 'View: %(filterOption)s', {
					args: { filterOption: selectedOption },
			  } )
			: undefined;
	};

	return (
		<div className="promote-post-i2__search-bar-wrapper payments">
			{ isDesktop ? (
				<SegmentedControl compact primary>
					{ options.map( ( option ) => (
						<SegmentedControl.Item
							key={ option.value }
							selected={ paymentsFilter === option.value }
							onClick={ () => handleChange( option.value as PaymentsFilterType ) }
						>
							<span ref={ ( el ) => ( tabsRef.current[ option.value ] = el ) }>
								{ option.label }
							</span>
						</SegmentedControl.Item>
					) ) }
				</SegmentedControl>
			) : (
				<SelectDropdown
					className="promote-post-i2__search-bar-dropdown payment-filter"
					onSelect={ ( option: DropdownOption ) => onChangePaymentFilterDropdown( option.value ) }
					options={ options }
					initialSelected={ paymentsFilter }
					selectedText={ getPaymentFilterLabel() }
				/>
			) }
		</div>
	);
}
