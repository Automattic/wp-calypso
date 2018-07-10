/**
 * External dependencies
 */
import {
	findLast,
	map,
	invert,
	mapValues,
	sortBy,
	throttle,
	last,
} from 'lodash';
import classnames from 'classnames';
import 'element-closest';

/**
 * WordPress dependencies
 */
import { Component, compose } from '@wordpress/element';
import { withSelect, withDispatch } from '@wordpress/data';
import { getDefaultBlockName } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import './style.scss';
import BlockListBlock from './block';
import IgnoreNestedEvents from './ignore-nested-events';
import DefaultBlockAppender from '../default-block-appender';

class BlockListLayout extends Component {
	constructor( props ) {
		super( props );

		this.onSelectionStart = this.onSelectionStart.bind( this );
		this.onSelectionEnd = this.onSelectionEnd.bind( this );
		this.onShiftSelection = this.onShiftSelection.bind( this );
		this.setBlockRef = this.setBlockRef.bind( this );
		this.setLastClientY = this.setLastClientY.bind( this );
		this.onPointerMove = throttle( this.onPointerMove.bind( this ), 100 );
		// Browser does not fire `*move` event when the pointer position changes
		// relative to the document, so fire it with the last known position.
		this.onScroll = () => this.onPointerMove( { clientY: this.lastClientY } );

		this.lastClientY = 0;
		this.nodes = {};
	}

	componentDidMount() {
		window.addEventListener( 'mousemove', this.setLastClientY );
	}

	componentWillUnmount() {
		window.removeEventListener( 'mousemove', this.setLastClientY );
	}

	setLastClientY( { clientY } ) {
		this.lastClientY = clientY;
	}

	setBlockRef( node, uid ) {
		if ( node === null ) {
			delete this.nodes[ uid ];
		} else {
			this.nodes = {
				...this.nodes,
				[ uid ]: node,
			};
		}
	}

	/**
	 * Handles a pointer move event to update the extent of the current cursor
	 * multi-selection.
	 *
	 * @param {MouseEvent} event A mousemove event object.
	 *
	 * @return {void}
	 */
	onPointerMove( { clientY } ) {
		// We don't start multi-selection until the mouse starts moving, so as
		// to avoid dispatching multi-selection actions on an in-place click.
		if ( ! this.props.isMultiSelecting ) {
			this.props.onStartMultiSelect();
		}

		const boundaries = this.nodes[ this.selectionAtStart ].getBoundingClientRect();
		const y = clientY - boundaries.top;
		const key = findLast( this.coordMapKeys, ( coordY ) => coordY < y );

		this.onSelectionChange( this.coordMap[ key ] );
	}

	/**
	 * Binds event handlers to the document for tracking a pending multi-select
	 * in response to a mousedown event occurring in a rendered block.
	 *
	 * @param {string} uid UID of the block where mousedown occurred.
	 *
	 * @return {void}
	 */
	onSelectionStart( uid ) {
		if ( ! this.props.isSelectionEnabled ) {
			return;
		}

		const boundaries = this.nodes[ uid ].getBoundingClientRect();

		// Create a uid to Y coördinate map.
		const uidToCoordMap = mapValues( this.nodes, ( node ) =>
			node.getBoundingClientRect().top - boundaries.top );

		// Cache a Y coördinate to uid map for use in `onPointerMove`.
		this.coordMap = invert( uidToCoordMap );
		// Cache an array of the Y coördinates for use in `onPointerMove`.
		// Sort the coördinates, as `this.nodes` will not necessarily reflect
		// the current block sequence.
		this.coordMapKeys = sortBy( Object.values( uidToCoordMap ) );
		this.selectionAtStart = uid;

		window.addEventListener( 'mousemove', this.onPointerMove );
		// Capture scroll on all elements.
		window.addEventListener( 'scroll', this.onScroll, true );
		window.addEventListener( 'mouseup', this.onSelectionEnd );
	}

	/**
	 * Handles multi-selection changes in response to pointer move.
	 *
	 * @param {string} uid Block under cursor in multi-select drag.
	 */
	onSelectionChange( uid ) {
		const { onMultiSelect, selectionStart, selectionEnd } = this.props;
		const { selectionAtStart } = this;
		const isAtStart = selectionAtStart === uid;

		if ( ! selectionAtStart || ! this.props.isSelectionEnabled ) {
			return;
		}

		// If multi-selecting and cursor extent returns to the start of
		// selection, cancel multi-select.
		if ( isAtStart && selectionStart ) {
			onMultiSelect( null, null );
		}

		// Expand multi-selection to block under cursor.
		if ( ! isAtStart && selectionEnd !== uid ) {
			onMultiSelect( selectionAtStart, uid );
		}
	}

	/**
	 * Handles a mouseup event to end the current cursor multi-selection.
	 *
	 * @return {void}
	 */
	onSelectionEnd() {
		// Cancel throttled calls.
		this.onPointerMove.cancel();

		delete this.coordMap;
		delete this.coordMapKeys;
		delete this.selectionAtStart;

		window.removeEventListener( 'mousemove', this.onPointerMove );
		window.removeEventListener( 'scroll', this.onScroll, true );
		window.removeEventListener( 'mouseup', this.onSelectionEnd );

		// We may or may not be in a multi-selection when mouseup occurs (e.g.
		// an in-place mouse click), so only trigger stop if multi-selecting.
		if ( this.props.isMultiSelecting ) {
			this.props.onStopMultiSelect();
		}
	}

	onShiftSelection( uid ) {
		if ( ! this.props.isSelectionEnabled ) {
			return;
		}

		const { selectionStartUID, onMultiSelect, onSelect } = this.props;

		if ( selectionStartUID ) {
			onMultiSelect( selectionStartUID, uid );
		} else {
			onSelect( uid );
		}
	}

	render() {
		const {
			blockUIDs,
			layout,
			isGroupedByLayout,
			rootUID,
			canInsertDefaultBlock,
		} = this.props;

		let defaultLayout;
		if ( isGroupedByLayout ) {
			defaultLayout = layout;
		}

		const classes = classnames( 'editor-block-list__layout', {
			[ `layout-${ layout }` ]: layout,
		} );

		return (
			<div className={ classes }>
				{ map( blockUIDs, ( uid, blockIndex ) => (
					<BlockListBlock
						key={ 'block-' + uid }
						index={ blockIndex }
						uid={ uid }
						blockRef={ this.setBlockRef }
						onSelectionStart={ this.onSelectionStart }
						onShiftSelection={ this.onShiftSelection }
						rootUID={ rootUID }
						layout={ defaultLayout }
						isFirst={ blockIndex === 0 }
						isLast={ blockIndex === blockUIDs.length - 1 }
					/>
				) ) }
				{ canInsertDefaultBlock && (
					<IgnoreNestedEvents childHandledEvents={ [ 'onFocus', 'onClick', 'onKeyDown' ] }>
						<DefaultBlockAppender
							rootUID={ rootUID }
							lastBlockUID={ last( blockUIDs ) }
							layout={ defaultLayout }
						/>
					</IgnoreNestedEvents>
				) }
			</div>
		);
	}
}

export default compose( [
	withSelect( ( select, ownProps ) => {
		const {
			isSelectionEnabled,
			isMultiSelecting,
			getMultiSelectedBlocksStartUid,
			getMultiSelectedBlocksEndUid,
			getBlockSelectionStart,
			canInsertBlockType,
		} = select( 'core/editor' );
		const { rootUID } = ownProps;

		return {
			selectionStart: getMultiSelectedBlocksStartUid(),
			selectionEnd: getMultiSelectedBlocksEndUid(),
			selectionStartUID: getBlockSelectionStart(),
			isSelectionEnabled: isSelectionEnabled(),
			isMultiSelecting: isMultiSelecting(),
			canInsertDefaultBlock: canInsertBlockType( getDefaultBlockName(), rootUID ),
		};
	} ),
	withDispatch( ( dispatch ) => {
		const {
			startMultiSelect,
			stopMultiSelect,
			multiSelect,
			selectBlock,
		} = dispatch( 'core/editor' );

		return {
			onStartMultiSelect: startMultiSelect,
			onStopMultiSelect: stopMultiSelect,
			onMultiSelect: multiSelect,
			onSelect: selectBlock,
		};
	} ),
] )( BlockListLayout );
