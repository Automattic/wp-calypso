/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import {
	Button,
	__experimentalTreeGrid as TreeGrid,
	__experimentalTreeGridRow as TreeGridRow,
	__experimentalTreeGridCell as TreeGridCell,
} from '@wordpress/components';

const groceries = [
	{
		name: 'Fruit',
		types: [
			{
				name: 'Apple',
			},
			{
				name: 'Orange',
			},
			{
				name: 'Pear',
			},
		],
	},
	{
		name: 'Vegetable',
		types: [
			{
				name: 'Cucumber',
			},
			{
				name: 'Parsnip',
			},
			{
				name: 'Pumpkin',
			},
		],
	},
];

const Descender = ( { level } ) => {
	if ( level === 1 ) {
		return <></>;
	}
	const indentation = '\u00A0'.repeat( ( level - 1 ) * 4 );

	return <span aria-hidden="true">{ indentation + '├ ' }</span>;
};

const Rows = ( { items, level = 1 } ) => {
	return items.map( ( item, index ) => {
		const hasChildren = !! item.types && !! item.types.length;
		return (
			<React.Fragment key={ item.name }>
				<TreeGridRow positionInSet={ index + 1 } setSize={ items.length } level={ level }>
					<TreeGridCell>
						{ ( props ) => (
							<>
								<Descender level={ level } />
								<Button isPrimary { ...props }>
									{ item.name }
								</Button>
							</>
						) }
					</TreeGridCell>
					<TreeGridCell>
						{ ( props ) => (
							<Button isSecondary { ...props }>
								Move Up
							</Button>
						) }
					</TreeGridCell>
					<TreeGridCell>
						{ ( props ) => (
							<Button isSecondary { ...props }>
								Move Down
							</Button>
						) }
					</TreeGridCell>
				</TreeGridRow>
				{ hasChildren && <Rows items={ item.types } level={ level + 1 } /> }
			</React.Fragment>
		);
	} );
};

const TreeGridExample = () => (
	<TreeGrid>
		<Rows items={ groceries } />
	</TreeGrid>
);

export default TreeGridExample;
