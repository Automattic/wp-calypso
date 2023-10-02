import styled from '@emotion/styled';
import { ToggleControl } from '@wordpress/components';
import { useEffect, useState } from 'react';

const TreeItemContainer = styled.div( {
	marginLeft: '1em',
} );

const ToggleControlWithHelpMargin = styled( ToggleControl )( {
	'.components-base-control__help': {
		marginLeft: '4em',
		marginTop: 0,
	},
} );

export interface CheckboxTreeItem {
	label: string;
	checked?: boolean;
	children?: CheckboxTreeItem[];
	subTitle?: string;
	name?: string;
}

interface CheckboxInternalItem extends CheckboxTreeItem {
	parent: string | null;
}

type InternalItemMap = {
	[ key: string ]: CheckboxInternalItem;
};

type InternalCheckboxTreeItemMap = {
	[ key: string ]: CheckboxTreeItem;
};

const fromInternal = ( data: InternalItemMap ): CheckboxTreeItem[] => {
	const parentMap = {} as InternalCheckboxTreeItemMap;

	for ( const key in data ) {
		const item = data[ key ];
		if ( item.parent === null ) {
			// No parent so this is a top level item
			const { parent, ...newItem } = item;
			parentMap[ key ] = { ...newItem, children: [] };
			continue;
		}
		if ( ! parentMap[ item.parent ] ) {
			const { parent, ...newItem } = data[ item.parent ];
			if ( ! parent ) {
				continue;
			}
			parentMap[ parent ] = {
				...newItem,
				children: [],
			};
		}
		const { parent, ...newItem } = item;
		parentMap[ parent ]?.children?.push( newItem );
	}

	return Object.values( parentMap );
};

function toInternal( nestedItems: CheckboxTreeItem[], parent: string | null = null, prefix = '' ) {
	let flatItems = {} as InternalItemMap;

	nestedItems.forEach( ( item, index ) => {
		// Create a unique ID based on the prefix (or parent ID) and current index.
		const id = `${ prefix }${ index + 1 }`;

		// Add the current item to the flat structure.
		flatItems[ id ] = {
			label: item.label,
			checked: item.checked || false,
			parent: parent,
			subTitle: item.subTitle,
		} as CheckboxInternalItem;

		// If there are sub-items, recursively convert them and merge into the current structure.
		if ( item.children && item.children.length > 0 ) {
			flatItems = {
				...flatItems,
				...toInternal( item?.children || ( [] as CheckboxInternalItem[] ), id, `${ id }-` ),
			};
		}
	} );

	return flatItems;
}

function CheckboxTreeItem( {
	id,
	items,
	onCheckChange,
	className,
	disabled,
}: {
	id: string;
	items: InternalItemMap;
	onCheckChange: ( id: string, isChecked: boolean ) => void;
	className?: string;
	disabled?: boolean;
} ) {
	const item = items[ id ];
	const parent = items[ item.parent ];
	const childIds = Object.keys( items ).filter( ( childId ) => items[ childId ].parent === id );

	const handleCheckChange = () => {
		onCheckChange( id, ! item.checked );
	};

	return (
		<TreeItemContainer className={ className }>
			<ToggleControlWithHelpMargin
				disabled={ parent?.checked === false || disabled }
				help={ item.subTitle }
				label={ item.label }
				checked={ item.checked }
				onChange={ handleCheckChange }
			/>
			{ childIds.map( ( childId ) => (
				<CheckboxTreeItem
					disabled={ disabled }
					className={ className }
					key={ childId }
					id={ childId }
					items={ items }
					onCheckChange={ onCheckChange }
				/>
			) ) }
		</TreeItemContainer>
	);
}

export default function CheckboxTree( {
	treeItems,
	disabled,
	onChange,
}: {
	treeItems: CheckboxTreeItem[];
	onChange: ( items: CheckboxTreeItem[] ) => void;
	disabled?: boolean;
} ) {
	const [ items, setItems ] = useState< InternalItemMap >( toInternal( treeItems, null, '' ) );

	const handleCheckChange = ( id: string, isChecked: boolean ) => {
		const newItems = { ...items } as InternalItemMap;

		// const updateChildCheckedState = ( currentId, isChecked ) => {
		// 	const children = Object.keys( newItems ).filter(
		// 		( childId ) => newItems[ childId ].parent === currentId
		// 	);
		// 	children.forEach( ( child ) => {
		// 		newItems[ child ].checked = isChecked;
		// 		updateChildCheckedState( child, isChecked ); // Recurse into further child levels
		// 	} );
		// };

		newItems[ id ].checked = isChecked;
		//
		// if ( isChecked === false ) {
		// 	updateChildCheckedState( id, false );
		// }

		setItems( newItems );
	};

	useEffect( () => {
		const selectedItems = [] as CheckboxTreeItem[];

		const newData = fromInternal( items );
		newData.forEach( ( item: CheckboxTreeItem ) => {
			const newItem = { ...item };
			if ( newItem.checked ) {
				newItem.children = newItem?.children?.filter(
					( child: CheckboxTreeItem ) => child.checked
				);
				selectedItems.push( newItem );
			}
		} );
		onChange( selectedItems );
	}, [ items, onChange ] );

	// Get the root nodes to begin rendering from the top level
	const rootIds = Object.keys( items ).filter( ( id ) => ! items[ id ].parent );

	return (
		<>
			{ rootIds?.map( ( rootId ) => (
				<CheckboxTreeItem
					disabled={ disabled }
					key={ rootId }
					id={ rootId }
					items={ items }
					onCheckChange={ handleCheckChange }
				/>
			) ) }
		</>
	);
}
