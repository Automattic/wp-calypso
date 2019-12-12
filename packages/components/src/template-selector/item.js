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
		handleTemplateConfirmation,
	} = props;

	if ( isNil( id ) || isNil( label ) || isNil( value ) ) {
		return null;
	}

	if ( useDynamicPreview && ( isNil( blocks ) || isEmpty( blocks ) ) ) {
		return null;
	}

	// Define static or dynamic preview.
	const innerPreview = (
		<img
			className="template-selector__item-media"
			src={ staticPreviewImg }
			alt={ staticPreviewImgAlt }
		/>
	);

	const labelId = `label-${ id }-${ value }`;

	/**
	 * Determines (based on whether the large preview is able to be visible at the
	 * current breakpoint) whether or not the Template selection UI interaction model
	 * should be select _and_ confirm or simply a single "tap to confirm".
	 */
	const handleLabelClick = () => {
		const largeTplPreviewVisible = window.matchMedia( '(min-width: 660px)' ).matches;
		// In both cases set the template as being selected
		onSelect( value );
		// Confirm the template when large preview isn't visible
		if ( ! largeTplPreviewVisible ) {
			handleTemplateConfirmation( value );
		}
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
