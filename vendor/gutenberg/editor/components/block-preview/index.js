/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { createBlock } from '@wordpress/blocks';
import { Disabled } from '@wordpress/components';

/**
 * Internal dependencies
 */
import BlockEdit from '../block-edit';
import './style.scss';

/**
 * Block Preview Component: It renders a preview given a block name and attributes.
 *
 * @param {Object} props Component props.
 *
 * @return {WPElement} Rendered element.
 */
function BlockPreview( props ) {
	return (
		<div className="editor-block-preview">
			<div className="editor-block-preview__title">{ __( 'Preview' ) }</div>
			<BlockPreviewContent { ...props } />
		</div>
	);
}

export function BlockPreviewContent( { name, attributes } ) {
	const block = createBlock( name, attributes );
	return (
		<Disabled className="editor-block-preview__content" aria-hidden>
			<BlockEdit
				name={ name }
				focus={ false }
				attributes={ block.attributes }
				setAttributes={ noop }
			/>
		</Disabled>
	);
}

export default BlockPreview;
