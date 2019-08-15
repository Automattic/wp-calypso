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
		dynamicPreview = false,
		preview,
		previewAlt = '',
		rawContent,
		blocksInPreview,
	} = props;

	const [ blocksLimit, setBlockLimit ] = useState( blocksInPreview );
	const blocks = useMemo( () => rawContent ? parseBlocks( rawContent ) : null, [ rawContent ] );

	const onFocusHandler = () => {
		if ( blocks.length > blocksLimit ) {
			setBlockLimit( null ); // not blocks limit to template preview
		}

		throttle( () => onFocus( value, label, blocks ), 300 );
	};

	const innerPreview = dynamicPreview ? (
		<BlockPreview
			blocks={ blocksLimit && blocks ? blocks.slice( 0, blocksLimit ) : blocks }
			viewportWidth={ 960 }
		/>
	) : (
		<img className="template-selector-item__media" src={ preview } alt={ previewAlt } />
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
