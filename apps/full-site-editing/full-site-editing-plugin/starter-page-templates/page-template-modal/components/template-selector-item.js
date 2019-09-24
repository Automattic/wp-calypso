/**
 * External dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { isNil, isEmpty } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import BlockPreview from './block-template-preview';
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

	/**
	 * Determines (based on arbitary "mobile" breakpoint) whether or not
	 * the Template selection UI interaction model should be select and confirm
	 * or simply a single "tap to confirm". The reason for this is that on larger screens
	 * the large preview is visible which necessitates the double interaction. Without this
	 * then only a single tap is necessary.
	 * @return {Function} the appropriate interaction handler function depending on the breakpoint match status
	 */
	const handleLabelClick = () => {
		return window.matchMedia( '(min-width: 660px)' ).matches
			? onSelect( value, label )
			: handleTemplateConfirmation();
	};

	return (
		<Fragment>
			<button
				type="button"
				className="template-selector-item__label"
				value={ value }
				onMouseEnter={ () => onFocus( value, label ) }
				onClick={ handleLabelClick }
				aria-labelledby={ `${ id } ${ labelId }` }
				aria-pressed={ isSelected }
			>
				<div className="template-selector-item__preview-wrap">{ innerPreview }</div>
				<span id={ labelId }>{ label }</span>
			</button>

			<Button
				className="template-selector-item__confirm-selection"
				isPrimary={ true }
				disabled={ ! isSelected }
				onClick={ handleTemplateConfirmation }
			>
				{ __( 'Use template', 'full-site-editing' ) }
			</Button>
		</Fragment>
	);
};

export default TemplateSelectorItem;
