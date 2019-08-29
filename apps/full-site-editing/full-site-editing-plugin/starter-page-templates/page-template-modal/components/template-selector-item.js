/**
 * External dependencies
 */
import { isNil, isEmpty } from 'lodash';

/**
 * WordPress dependencies
 */
import BlockPreview from './block-template-preview';
import { Disabled } from '@wordpress/components';

const TemplateSelectorItem = props => {
	const {
		id,
		value,
		onFocus,
		onSelect,
		label,
		useDynamicPreview = false,
		staticPreviewImg,
		staticPreviewImgAlt = '',
		blocks,
	} = props;

	if ( isNil( id ) || isNil( label ) || isNil( value ) ) {
		return null;
	}

	if ( ! useDynamicPreview && isNil( staticPreviewImg ) ) {
		return null;
	}

	if ( useDynamicPreview && ( isNil( blocks ) || isEmpty( blocks ) ) ) {
		return null;
	}

	// Define static or dynamic preview.
	const innerPreview = useDynamicPreview ? (
		<Disabled>
			<BlockPreview blocks={ blocks } viewportWidth={ 960 } />
		</Disabled>
	) : (
		<img
			className="template-selector-item__media"
			src={ staticPreviewImg }
			alt={ staticPreviewImgAlt }
		/>
	);

	const labelId = `label-${ id }-${ value }`;

	return (
		<button
			type="button"
			className="template-selector-item__label"
			value={ value }
			onMouseEnter={ () => onFocus( value, label ) }
			onClick={ () => onSelect( value, label ) }
			aria-labelledby={ `${ id } ${ labelId }` }
		>
			<div className="template-selector-item__preview-wrap">{ innerPreview }</div>
			<span id={ labelId }>{ label }</span>
		</button>
	);
};

export default TemplateSelectorItem;
