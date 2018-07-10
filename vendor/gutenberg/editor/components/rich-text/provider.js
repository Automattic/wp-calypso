/**
 * External dependencies
 */
import { pick, noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';

/**
 * The RichText Provider allows a rendering context to define global behaviors
 * without requiring intermediate props to be passed through to the RichText.
 * The provider accepts as props its `childContextTypes` which are passed to
 * any RichText instance.
 */
class RichTextProvider extends Component {
	getChildContext() {
		return pick(
			this.props,
			Object.keys( this.constructor.childContextTypes )
		);
	}

	render() {
		return this.props.children;
	}
}

RichTextProvider.childContextTypes = {
	onUndo: noop,
	onRedo: noop,
	onCreateUndoLevel: noop,
};

export default RichTextProvider;
