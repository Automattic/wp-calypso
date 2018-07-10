/**
 * WordPress dependencies
 */
import { Component, RawHTML } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { serialize } from '../api';

/**
 * An internal block component used in block content serialization to inject
 * nested block content within the `save` implementation of the ancestor
 * component in which it is nested. The component provides a pre-bound
 * `BlockContent` component via context, which is used by the developer-facing
 * `InnerBlocks.Content` component to render block content.
 *
 * @example
 *
 * ```jsx
 * <BlockContentProvider innerBlocks={ innerBlocks }>
 * 	{ blockSaveElement }
 * </BlockContentProvider>
 * ```
 */
class BlockContentProvider extends Component {
	getChildContext() {
		const { innerBlocks } = this.props;

		return {
			BlockContent() {
				// Value is an array of blocks, so defer to block serializer
				const html = serialize( innerBlocks );

				// Use special-cased raw HTML tag to avoid default escaping
				return <RawHTML>{ html }</RawHTML>;
			},
		};
	}

	render() {
		return this.props.children;
	}
}

BlockContentProvider.childContextTypes = {
	BlockContent: () => {},
};

export default BlockContentProvider;
