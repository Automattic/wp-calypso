import styled from '@emotion/styled';
import { ToggleControl } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { useState, useEffect } from 'react';

const DangerousItemsContainer = styled.div( {
	marginTop: '16px',
	padding: '16px',
	marginBottom: '24px',
	border: '1px solid #D63638',
	borderRadius: '4px',
} );

const DangerousItemsTitle = styled.p( {
	fontWeight: 500,
	marginBottom: '16px',
	color: '#D63638',
} );

const ToggleControlWithHelpMargin = styled( ToggleControl )( {
	'.components-base-control__help': {
		marginLeft: '4em',
		marginTop: 0,
	},
	marginBottom: '8px !important',
	'.components-flex': {
		gap: '8px',
	},
} );

export interface CheckboxOptionItem {
	label: string;
	checked: boolean;
	subTitle?: string;
	isDangerous: boolean;
	name: string;
}

export default function SyncOptionsPanel( {
	items,
	disabled,
	onChange,
}: {
	items: CheckboxOptionItem[];
	disabled: boolean;
	onChange: ( items: CheckboxOptionItem[] ) => void;
} ) {
	const initialItemsMap = items.reduce(
		( acc, item ) => {
			acc[ item.name ] = item;
			return acc;
		},
		{} as { [ key: string ]: CheckboxOptionItem }
	);

	const [ optionItemsMap, setOptionItemsMap ] = useState( initialItemsMap );

	// Change it to useMemo
	const dangerousItems = Object.values( optionItemsMap ).filter( ( item ) => item.isDangerous );
	const nonDangerousItems = Object.values( optionItemsMap ).filter(
		( item ) => ! item.isDangerous
	);

	const handleCheckChange = ( item: CheckboxOptionItem ) => {
		const newItemsMap = { ...optionItemsMap };
		newItemsMap[ item.name ].checked = ! newItemsMap[ item.name ].checked;
		setOptionItemsMap( newItemsMap );
	};

	useEffect( () => {
		if ( ! onChange ) {
			return;
		}
		const selectedItems = [] as CheckboxOptionItem[];

		Object.values( optionItemsMap ).forEach( ( item: CheckboxOptionItem ) => {
			if ( item.checked ) {
				selectedItems.push( item );
			}
		} );
		onChange( selectedItems );
	}, [ optionItemsMap, onChange ] );

	return (
		<>
			{ nonDangerousItems.map( ( item ) => {
				return (
					<ToggleControlWithHelpMargin
						key={ item.name }
						disabled={ disabled }
						help={ item.subTitle }
						label={ item.label }
						checked={ item.checked }
						onChange={ () => handleCheckChange( item ) }
					/>
				);
			} ) }
			<DangerousItemsContainer>
				<DangerousItemsTitle>{ translate( 'Danger zone' ) }</DangerousItemsTitle>
				{ dangerousItems.map( ( item ) => {
					return (
						<div data-testid="danger-zone-checkbox" key={ item.name }>
							<ToggleControl
								data-testid="danger-zone-checkbox"
								disabled={ disabled }
								help={ item.subTitle }
								label={ item.label }
								checked={ item.checked }
								onChange={ () => handleCheckChange( item ) }
							/>
						</div>
					);
				} ) }
			</DangerousItemsContainer>
		</>
	);
}
