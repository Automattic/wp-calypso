import styled from '@emotion/styled';
import { CustomSelectControl } from '@wordpress/components';
import { useState } from 'react';
import { IntervalTypeProps } from '../types';

const AddOnOption = styled.div`
	.discount {
		color: var( --studio-green-40 );
		display: inline-block;
		font-size: 0.7rem;
	}
	.name {
		margin-right: 4px;
	}
`;

const StyledCustomSelectControl = styled( CustomSelectControl )`
	.components-custom-select-control__button {
		min-width: 195px;
	}
	.components-custom-select-control__menu {
		margin: 0;
	}
`;

const optionsList = [
	{ key: 'yearly', name: 'Pay yearly', discountText: '55% off' },
	{ key: '2yearly', name: 'Pay every 2 years', discountText: '63% off' },
	{ key: '3yearly', name: 'Pay every 3 years', discountText: '69% off' },
	{ key: 'monthly', name: 'Pay monthly', discountText: '' },
];

export const IntervalTypeDropdown: React.FunctionComponent< IntervalTypeProps > = () => {
	const [ selectedTerm, setSelectedTerm ] = useState( optionsList[ 0 ] );

	return (
		<StyledCustomSelectControl
			label=""
			options={ optionsList.map( ( option ) => ( {
				key: option.key,
				name: (
					<AddOnOption>
						<span className="name"> { option.name } </span>
						<span className="discount"> { option.discountText } </span>
					</AddOnOption>
				),
			} ) ) }
			value={ selectedTerm }
			onChange={ ( newSelectedTerm: { selectedItem: ( typeof optionsList )[ number ] } ) => {
				setSelectedTerm( newSelectedTerm.selectedItem );
			} }
		/>
	);
};
