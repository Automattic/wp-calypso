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

const CustomTreeNode = ( {
	node,
	onNodeSelect,
} ) => {
	const children = ( node.children ? renderChildren( node.children, onNodeSelect ) : null );

	return (
		<div className="custom-tree-selector__node">
			<FormLabel>
				{ renderSelector( node, onNodeSelect ) }
				<span className="custom-tree-selector__label">{ node.label }</span>
				{ children }
			</FormLabel>
		</div>
	);
};

CustomTreeNode.PropTypes = {
	node: PropTypes.object.isRequired,
	onNodeSelect: PropTypes.func.isRequired,
};

export default CustomTreeNode;

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
			return <CustomTreeNode key={ child.key } node={ child } onNodeSelect={ onNodeSelect } />;
		}
	);

	return (
		<div className="custom-tree-selector__indent">
			{ childNodes }
		</div>
	);
}

function generateOnChange( node, onNodeSelect ) {
	return ( e ) => {
		const selected = e.target.checked;
		const callback = node.onSelect || onNodeSelect;

		if ( ! callback ) {
			warn( `CustomTreeNode: No onNodeSelect and node ${ node.key } has no onSelect.` );
			return;
		}

		callback( node, selected );
	};
}

