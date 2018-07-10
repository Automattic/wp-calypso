/**
 * External dependencies
 */
import { omit } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component, compose } from '@wordpress/element';
import { withSelect, withDispatch } from '@wordpress/data';

class BlockSelectionClearer extends Component {
	constructor() {
		super( ...arguments );

		this.bindContainer = this.bindContainer.bind( this );
		this.clearSelectionIfFocusTarget = this.clearSelectionIfFocusTarget.bind( this );
	}

	bindContainer( ref ) {
		this.container = ref;
	}

	/**
	 * Clears the selected block on focus if the container is the target of the
	 * focus. This assumes no other descendents have received focus until event
	 * has bubbled to the container.
	 *
	 * @param {FocusEvent} event Focus event.
	 */
	clearSelectionIfFocusTarget( event ) {
		const {
			hasSelectedBlock,
			hasMultiSelection,
			clearSelectedBlock,
		} = this.props;

		const hasSelection = ( hasSelectedBlock || hasMultiSelection );
		if ( event.target === this.container && hasSelection ) {
			clearSelectedBlock();
		}
	}

	render() {
		return (
			<div
				tabIndex={ -1 }
				onFocus={ this.clearSelectionIfFocusTarget }
				ref={ this.bindContainer }
				{ ...omit( this.props, [
					'clearSelectedBlock',
					'hasSelectedBlock',
					'hasMultiSelection',
				] ) }
			/>
		);
	}
}

export default compose( [
	withSelect( ( select ) => {
		const { hasSelectedBlock, hasMultiSelection } = select( 'core/editor' );

		return {
			hasSelectedBlock: hasSelectedBlock(),
			hasMultiSelection: hasMultiSelection(),
		};
	} ),
	withDispatch( ( dispatch ) => {
		const { clearSelectedBlock } = dispatch( 'core/editor' );
		return { clearSelectedBlock };
	} ),
] )( BlockSelectionClearer );
