/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import CustomTreeNode from './custom-tree-node';

function renderPlaceholders() {
	return (
		<div>
			<div className="custom-tree-selector__placeholder" />
			<div className="custom-tree-selector__placeholder" />
			<div className="custom-tree-selector__placeholder" />
		</div>
	);
}

const CustomTreeSelector = ( {
	nodes,
	onNodeSelect,
} ) => {
	const renderedNodes = nodes && nodes.map( ( node ) => {
		return (
			<CustomTreeNode
				key={ node.key }
				node={ node }
				onNodeSelect={ onNodeSelect }
			/>
		);
	} );

	return (
		<div className="custom-tree-selector">
			{ ! nodes && renderPlaceholders() }
			{ renderedNodes }
		</div>
	);
};

CustomTreeSelector.PropTypes = {
	nodes: PropTypes.array,
	onNodeSelect: PropTypes.func,
};

export default CustomTreeSelector;
