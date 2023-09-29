import { Button } from '@automattic/components';
import styled from '@emotion/styled';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState, useEffect } from 'react';

const StagingSyncCardContainer = styled.div( {
	display: 'flex',
	'&&&': {
		flexDirection: 'column',
	},
} );

const Bold = styled.p( {
	fontWeight: 700,
} );

const synchromizeItems = [
	{
		label: 'Database',
		checked: false,
		subItems: [
			{ label: 'Posts', checked: true, subItems: [], subTitle: 'Posts and pages content' },
			{ label: 'Pages', checked: true, subItems: [] },
		],
	},
	{
		label: 'Files',
		checked: false,
		subItems: [],
		subTitle: 'Media, themes, and plugins',
	},
	{
		label: 'Media',
		checked: true,
		subItems: [],
		subTitle: 'Media, themes, and plugins',
	},
];

function convertToFlatStructure( nestedItems, parent = null, prefix = '' ) {
	let flatItems = {};

	nestedItems.forEach( ( item, index ) => {
		// Create a unique ID based on the prefix (or parent ID) and current index.
		const id = `${ prefix }${ index + 1 }`;

		// Add the current item to the flat structure.
		flatItems[ id ] = {
			label: item.label,
			checked: item.checked,
			parent: parent,
		};

		// If there are sub-items, recursively convert them and merge into the current structure.
		if ( item.subItems && item.subItems.length > 0 ) {
			flatItems = {
				...flatItems,
				...convertToFlatStructure( item.subItems, id, `${ id }-` ),
			};
		}
	} );

	return flatItems;
}

function TreeItem( { id, items, onCheckChange } ) {
	const item = items[ id ];
	const parent = items[ item.parent ];
	const childIds = Object.keys( items ).filter( ( childId ) => items[ childId ].parent === id );

	const handleCheckChange = () => {
		onCheckChange( id, ! item.checked );
	};

	return (
		<div style={ { marginLeft: '1em' } }>
			<ToggleControl
				disabled={ parent?.checked === false }
				help={ item.subtitle }
				label={ item.label }
				checked={ item.checked }
				onChange={ handleCheckChange }
			/>
			{ childIds.map( ( childId ) => (
				<TreeItem key={ childId } id={ childId } items={ items } onCheckChange={ onCheckChange } />
			) ) }
		</div>
	);
}

const CheckboxTree = ( { treeItems, onUpdateSelectedItems } ) => {
	const [ items, setItems ] = useState( convertToFlatStructure( treeItems ) );

	const handleCheckChange = ( id, isChecked ) => {
		const newItems = { ...items };

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
		const selectedItems = [];

		Object.values( items ).forEach( ( item ) => {
			if ( ! item.checked ) {
				return;
			}
			if ( item.parent ) {
				const parent = items[ item.parent ];
				if ( ! parent.checked ) {
					return;
				}
			}
			selectedItems.push( item );
		} );
		onUpdateSelectedItems( selectedItems );
	}, [ items, onUpdateSelectedItems ] );

	// Get the root nodes to begin rendering from the top level
	const rootIds = Object.keys( items ).filter( ( id ) => ! items[ id ].parent );

	return (
		<>
			{ rootIds?.map( ( rootId ) => (
				<TreeItem
					key={ rootId }
					id={ rootId }
					items={ items }
					onCheckChange={ handleCheckChange }
				/>
			) ) }
		</>
	);
};

export default function StagingSiteSyncCard( {
	onSyncronize = () => {
		return null;
	},
	disabled,
} ) {
	const translate = useTranslate();
	const [ selectedItems, setSelectedItems ] = useState( [] );
	const onSyncronizeInternal = useCallback( () => {
		onSyncronize( selectedItems );
	}, [ onSyncronize, selectedItems ] );

	return (
		<StagingSyncCardContainer>
			<Bold>{ translate( 'Data and File synchronization' ) }</Bold>
			<p>
				{ translate(
					'Keep your database and files synchronized between the production and staging environments.'
				) }
			</p>
			<Bold>{ translate( 'Choose synchronization direction' ) }</Bold>
			<CheckboxTree treeItems={ synchromizeItems } onUpdateSelectedItems={ setSelectedItems } />
			<Button primary onClick={ onSyncronizeInternal } disabled={ disabled }>
				<span>{ translate( 'Synchronize' ) }</span>
			</Button>
		</StagingSyncCardContainer>
	);
}
