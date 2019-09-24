/**
 * External dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { isNil, isEmpty } from 'lodash';
/* eslint-enable import/no-extraneous-dependencies */

/**
 * WordPress dependencies
 */
import BlockPreview from './block-template-preview';
/* eslint-disable import/no-extraneous-dependencies */
import { Disabled, Button } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
/* eslint-enable import/no-extraneous-dependencies */

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
		blocks = [],
		isSelected = false,
		handleTemplateConfirmation,
	} = props;

	if ( isNil( id ) || isNil( label ) || isNil( value ) ) {
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
		<Fragment>
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
			{ isSelected && (
				<Button
					className="template-selector-item__confirm-selection"
					isPrimary={ true }
					onClick={ handleTemplateConfirmation }
				>
					Use { label } <span>template</span>
				</Button>
			) }
		</Fragment>
	);
};

export default TemplateSelectorItem;
