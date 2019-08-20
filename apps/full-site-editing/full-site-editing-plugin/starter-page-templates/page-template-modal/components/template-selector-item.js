/**
 * External dependencies
 */
import { debounce } from 'lodash';

/**
 * Internal dependencies
 */

/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import BlockPreview from './block-template-preview';
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
		numBlocksInPreview,
		blocks = [],
	} = props;

	const ON_FOCUS_DELAY = 500;

	const [ blocksLimit, setBlockLimit ] = useState( numBlocksInPreview );

	const onFocusHandler = debounce( () => {
		if ( blocks && blocks.length > blocksLimit ) {
			setBlockLimit( null ); // not blocks limit to template preview
		}

		onFocus( value, label, blocks );
	}, ON_FOCUS_DELAY );

	// Define static or dynamic preview.
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

	return (
		<button
			type="button"
			id={ `${ id }-${ value }` }
			className="template-selector-item__label"
			value={ value }
			// onFocus={ onFocusHandler }
			onMouseEnter={ onFocusHandler }
			onMouseLeave={ onFocusHandler.cancel }
			onClick={ () => onSelect( value, label, blocks ) }
			aria-describedby={ help ? `${ id }__help` : undefined }
		>
			<div className="template-selector-item__preview-wrap">{ innerPreview }</div>
			{ label }
		</button>
	);
};

export default TemplateSelectorItem;
