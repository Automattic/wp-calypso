/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import TreeNode from './tree-node';

function renderPlaceholders() {
	return (
		<div>
			<div className="tree-selector__placeholder" />
			<div className="tree-selector__placeholder" />
			<div className="tree-selector__placeholder" />
		</div>
	);
}

const TreeSelector = ( {
	nodes,
	onNodeSelect,
} ) => {
	const renderedNodes = nodes && nodes.map( ( node ) => {
		return (
			<TreeNode
				key={ node.key }
				node={ node }
				onNodeSelect={ onNodeSelect }
			/>
		);
	} );

	return (
		<div className="tree-selector">
			{ ! nodes && renderPlaceholders() }
			{ renderedNodes }
		</div>
	);
};

TreeSelector.PropTypes = {
	nodes: PropTypes.array,
	onNodeSelect: PropTypes.func,
};

export default TreeSelector;
