/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import warn from 'lib/warn';
import FormLabel from 'components/forms/form-label';
import FormInputCheckbox from 'components/forms/form-checkbox';

const TreeNode = ( {
	node,
	onNodeSelect,
} ) => {
	const children = ( node.children ? renderChildren( node.children, onNodeSelect ) : null );

	return (
		<div className="tree-selector__node">
			<FormLabel>
				{ renderSelector( node, onNodeSelect ) }
				<span className="tree-selector__label">{ node.label }</span>
				{ children }
			</FormLabel>
		</div>
	);
};

TreeNode.PropTypes = {
	node: PropTypes.object.isRequired,
	onNodeSelect: PropTypes.func.isRequired,
};

export default TreeNode;

function renderSelector( node, onNodeSelect ) {
	if ( null === node.onSelect ) {
		return null;
	}

	const onChange = generateOnChange( node, onNodeSelect );
	return (
		<FormInputCheckbox checked={ node.selected } onChange={ onChange } />
	);
}

function renderChildren( children, onNodeSelect ) {
	const childNodes = children.map(
		( child ) => {
			return <TreeNode key={ child.key } node={ child } onNodeSelect={ onNodeSelect } />;
		}
	);

	return (
		<div className="tree-selector__indent">
			{ childNodes }
		</div>
	);
}

function generateOnChange( node, onNodeSelect ) {
	return ( e ) => {
		const selected = e.target.checked;
		const callback = node.onSelect || onNodeSelect;

		if ( ! callback ) {
			warn( `TreeNode: No onNodeSelect and node ${ node.key } has no onSelect.` );
			return;
		}

		callback( node, selected );
	};
}

