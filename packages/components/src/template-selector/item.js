/**
 * External dependencies
 */
import React from 'react';
import { isNil, isEmpty } from 'lodash';
import classnames from 'classnames';

const TemplateSelectorItem = props => {
	const {
		id,
		value,
		onSelect,
		label,
		useDynamicPreview = false,
		staticPreviewImg,
		staticPreviewImgAlt = '',
		blocks = [],
		isSelected,
	} = props;

	if ( isNil( id ) || isNil( label ) || isNil( value ) ) {
		return null;
	}

	if ( useDynamicPreview && ( isNil( blocks ) || isEmpty( blocks ) ) ) {
		return null;
	}

	// Define preview.
	const innerPreview = (
		<img
			className="template-selector__item-media"
			src={ staticPreviewImg }
			alt={ staticPreviewImgAlt }
		/>
	);

	const labelId = `label-${ id }-${ value }`;

	const handleLabelClick = () => {
		onSelect( value );
	};

	return (
		<button
			type="button"
			className={ classnames( 'template-selector__item-label', {
				'is-selected': isSelected,
			} ) }
			value={ value }
			onClick={ handleLabelClick }
			aria-labelledby={ `${ id } ${ labelId }` }
		>
			<div className="template-selector__item-preview-wrap">{ innerPreview }</div>
			<span className="template-selector__item-template-title" id={ labelId }>
				{ label }
			</span>
		</button>
	);
};

export default TemplateSelectorItem;
