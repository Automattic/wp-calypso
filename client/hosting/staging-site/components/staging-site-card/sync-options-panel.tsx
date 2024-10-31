import styled from '@emotion/styled';
import { ToggleControl } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { useState, useEffect, useMemo } from 'react';

const DangerousItemsContainer = styled.div( {
	marginTop: '16px',
	padding: '16px',
	marginBottom: '24px',
	border: '1px solid #D63638',
	borderRadius: '4px',
	'.components-toggle-control': {
		paddingTop: '8px',
		marginBottom: '0px',
	},
} );

const DangerousItemsTitle = styled.p( {
	fontWeight: 500,
	marginBottom: '8px',
	color: '#D63638',
} );

const ToggleControlWithHelpMargin = styled( ToggleControl )( {
	'.components-base-control__help': {
		marginTop: 0,
	},
	label: {
		fontSize: '14px',
	},
	marginBottom: '8px !important',
	'.components-flex': {
		gap: '8px',
	},
} );

const ToggleWithLabelFontSize = styled( ToggleControl )( {
	label: {
		fontSize: '14px',
	},
	'.components-flex': {
		gap: '8px',
	},
} );

const ItemSubtitle = styled.span( {
	fontSize: '14px',
	color: 'var(--color-text-subtle) (#646970)',
	fontStyle: 'italic',
} );

export interface CheckboxOptionItem {
	label: string;
	checked: boolean;
	subTitle?: React.ReactNode;
	isDangerous: boolean;
	name: string;
}

export default function SyncOptionsPanel( {
	items,
	reset,
	disabled,
	onChange,
	isSqlsOptionDisabled,
}: {
	items: CheckboxOptionItem[];
	reset: boolean;
	disabled: boolean;
	onChange: ( items: CheckboxOptionItem[] ) => void;
	isSqlsOptionDisabled: boolean;
} ) {
	const initialItemsMap = useMemo(
		() =>
			items
				.sort( ( a, b ) => {
					if ( a.isDangerous === b.isDangerous ) {
						return 0;
					}
					return a.isDangerous ? 1 : -1;
				} )
				.reduce(
					( acc, item ) => {
						acc[ item.name ] = { ...item };
						return acc;
					},
					{} as { [ key: string ]: CheckboxOptionItem }
				),
		[ items ]
	);

	const [ optionItemsMap, setOptionItemsMap ] = useState( initialItemsMap );

	useEffect( () => {
		if ( reset ) {
			setOptionItemsMap(
				items
					.sort( ( a, b ) => {
						if ( a.isDangerous === b.isDangerous ) {
							return 0;
						}
						return a.isDangerous ? 1 : -1;
					} )
					.reduce(
						( acc, item ) => {
							acc[ item.name ] = { ...item };
							return acc;
						},
						{} as { [ key: string ]: CheckboxOptionItem }
					)
			);
		}
	}, [ reset, items ] );

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
						help={ <ItemSubtitle>{ item.subTitle }</ItemSubtitle> }
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
							{ 'sqls' === item.name && isSqlsOptionDisabled ? (
								<ToggleWithLabelFontSize
									data-testid="danger-zone-checkbox"
									disabled
									help={
										<ItemSubtitle>
											{ translate(
												'Site database synchronization is disabled because WooCommerce sites are not supported.'
											) }
										</ItemSubtitle>
									}
									label={ item.label }
									checked={ item.checked }
									onChange={ () => handleCheckChange( item ) }
								/>
							) : (
								<ToggleWithLabelFontSize
									data-testid="danger-zone-checkbox"
									disabled={ disabled || isSqlsOptionDisabled }
									help={ <ItemSubtitle>{ item.subTitle }</ItemSubtitle> }
									label={ item.label }
									checked={ item.checked }
									onChange={ () => handleCheckChange( item ) }
								/>
							) }
						</div>
					);
				} ) }
			</DangerousItemsContainer>
		</>
	);
}
