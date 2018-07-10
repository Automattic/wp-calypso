/**
 * External dependencies
 */
import {
	reduce,
	get,
	map,
} from 'lodash';

/**
 * WordPress dependencies
 */
import { createElement } from '@wordpress/element';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import './style.scss';
import BlockListLayout from './layout';

const UngroupedLayoutBlockList = withSelect(
	( select, ownProps ) => ( {
		blockUIDs: select( 'core/editor' ).getBlockOrder( ownProps.rootUID ),
	} )
)( BlockListLayout );

const GroupedLayoutBlockList = withSelect(
	( select, ownProps ) => ( {
		blocks: select( 'core/editor' ).getBlocks( ownProps.rootUID ),
	} ),
)( ( {
	blocks,
	layouts,
	...props
} ) => map( layouts, ( layout ) => {
	// Filter blocks assigned to layout when rendering grouped layouts.
	const layoutBlockUIDs = reduce( blocks, ( result, block ) => {
		if ( get( block, [ 'attributes', 'layout' ] ) === layout.name ) {
			result.push( block.uid );
		}

		return result;
	}, [] );

	return (
		<BlockListLayout
			key={ layout.name }
			layout={ layout.name }
			isGroupedByLayout
			blockUIDs={ layoutBlockUIDs }
			{ ...props }
		/>
	);
} ) );

const BlockList = ( props ) => createElement(
	// BlockList can be provided with a layouts configuration, either grouped
	// (blocks adjacent in markup) or ungrouped. This is inferred by the shape
	// of the layouts configuration passed (grouped layout as array).
	Array.isArray( props.layouts ) ?
		GroupedLayoutBlockList :
		UngroupedLayoutBlockList,
	props
);

export default BlockList;
