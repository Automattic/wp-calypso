/**
 * External dependencies
 */
import { throttle } from 'lodash';

/**
 * Internal dependencies
 */

/**
 * WordPress dependencies
 */
import { useState, useMemo } from '@wordpress/element';
import BlockPreview from './block-template-preview';
import { parse as parseBlocks } from '@wordpress/blocks';

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
		<BlockPreview
			blocks={ blocksLimit && blocks ? blocks.slice( 0, blocksLimit ) : blocks }
			viewportWidth={ 960 }
		/>
	) : (
		<img
			className="template-selector-item__media"
			src={ staticPreviewImg }
			alt={ staticPreviewImgAlt }
		/>
	);

	return (
		<button
			type="button"
			id={ `${ id }-${ value }` }
			className="template-selector-item__label"
			value={ value }
			onClick={ () => onSelect( value, label, blocks ) }
			onMouseEnter={ onFocusHandler }
			aria-describedby={ help ? `${ id }__help` : undefined }
		>
			<div className="template-selector-item__preview-wrap">{ innerPreview }</div>
			{ label }
		</button>
	);
};

export default TemplateSelectorItem;
