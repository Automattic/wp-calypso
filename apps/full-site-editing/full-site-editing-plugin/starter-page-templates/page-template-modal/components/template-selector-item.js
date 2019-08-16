/**
 * External dependencies
 */
import { throttle, noop } from 'lodash';
import HoverIntent from 'react-hoverintent';
/**
 * Internal dependencies
 */

/**
 * WordPress dependencies
 */
import { useState, useMemo } from '@wordpress/element';
import BlockPreview from './block-template-preview';
import { parse as parseBlocks } from '@wordpress/blocks';
import { Disabled } from '@wordpress/components';

const TemplateSelectorItem = props => {
	const {
		id,
		value,
		help,
		onFocus,
		onSelect,
		label,
		useDynamicPreview = false,
		staticPreviewImg,
		staticPreviewImgAlt = '',
		rawContent,
		numBlocksInPreview,
	} = props;

	const [ blocksLimit, setBlockLimit ] = useState( numBlocksInPreview );
	const blocks = useMemo( () => ( rawContent ? parseBlocks( rawContent ) : null ), [ rawContent ] );

	const onFocusHandler = () => {
		if ( blocks && blocks.length > blocksLimit ) {
			setBlockLimit( null ); // not blocks limit to template preview
		}

		throttle( () => onFocus( value, label, blocks ), 300 );
	};

	const innerPreview = useDynamicPreview ? (
		<Disabled>
			<BlockPreview
				blocks={ blocksLimit && blocks ? blocks.slice( 0, blocksLimit ) : blocks }
				viewportWidth={ 960 }
			/>
		</Disabled>
	) : (
		<img
			className="template-selector-item__media"
			src={ staticPreviewImg }
			alt={ staticPreviewImgAlt }
		/>
	);

	// We're disabling this rule because `HoverIntent` requires a handler for
	// onMouseOut but it doesn't actually do anything so there's no need need
	// to provide a matching keyboard handler for this event

	/* eslint-disable jsx-a11y/mouse-events-have-key-events */
	return (
		<HoverIntent onMouseOver={ onFocusHandler } onMouseOut={ noop }>
			<button
				type="button"
				id={ `${ id }-${ value }` }
				className="template-selector-item__label"
				value={ value }
				onFocus={ onFocusHandler }
				onClick={ () => onSelect( value, label, blocks ) }
				aria-describedby={ help ? `${ id }__help` : undefined }
			>
				<div className="template-selector-item__preview-wrap">{ innerPreview }</div>
				{ label }
			</button>
		</HoverIntent>
	);
	/* eslint-enable jsx-a11y/mouse-events-have-key-events */
};

export default TemplateSelectorItem;
