/**
 * External dependencies
 */
import scrollIntoView from 'dom-scroll-into-view';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';
import { withSelect } from '@wordpress/data';
import { getScrollContainer } from '@wordpress/dom';

/**
 * Internal dependencies
 */
import { getBlockDOMNode } from '../../utils/dom';

class MultiSelectScrollIntoView extends Component {
	componentDidUpdate() {
		// Relies on expectation that `componentDidUpdate` will only be called
		// if value of `extentUID` changes.
		this.scrollIntoView();
	}

	/**
	 * Ensures that if a multi-selection exists, the extent of the selection is
	 * visible within the nearest scrollable container.
	 *
	 * @return {void}
	 */
	scrollIntoView() {
		const { extentUID } = this.props;
		if ( ! extentUID ) {
			return;
		}

		const extentNode = getBlockDOMNode( extentUID );
		if ( ! extentNode ) {
			return;
		}

		const scrollContainer = getScrollContainer( extentNode );

		// If there's no scroll container, it follows that there's no scrollbar
		// and thus there's no need to try to scroll into view.
		if ( ! scrollContainer ) {
			return;
		}

		scrollIntoView( extentNode, scrollContainer, {
			onlyScrollIfNeeded: true,
		} );
	}

	render() {
		return null;
	}
}

export default withSelect( ( select ) => {
	return {
		extentUID: select( 'core/editor' ).getLastMultiSelectedBlockUid(),
	};
} )( MultiSelectScrollIntoView );
