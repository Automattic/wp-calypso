/**
 * External dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { isNil, isEmpty } from 'lodash';

/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';

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
	 * Determines (based on whether the large preview is able to be visible at the
	 * current breakpoint) whether or not the Template selection UI interaction model
	 * should be select _and_ confirm or simply a single "tap to confirm".
	 * The reason for this is that on larger screens the large preview is visible
	 * which necessitates the double interaction. Without this then only a single tap
	 * is necessary.
	 *
	 * @param  {string} tplSlug template slug string from the button value attr
	 * @param  {string} tplName template name string from the button text
	 */
	const handleLabelClick = ( tplSlug, tplName ) => {
		const largeTplPreviewVisible = window.matchMedia( '(min-width: 660px)' ).matches;

		// On both case set the template as being selected
		onSelect( tplSlug, tplName );

		// Only on screens where large preview is not visible immediately
		// confirm the template with no further interaction step
		if ( ! largeTplPreviewVisible ) {
			handleTemplateConfirmation( tplSlug, tplName );
		}
	};

	return (
		<Fragment>
			<button
				type="button"
				className="template-selector-item__label"
				value={ value }
				onMouseEnter={ () => onFocus( value, label ) }
				onClick={ () => handleLabelClick( value, label ) }
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
				onClick={ () => handleTemplateConfirmation( value, label ) }
			>
				{ sprintf( __( 'Use %s template', 'full-site-editing' ), label ) }
			</Button>
		</Fragment>
	);
};

export default TemplateSelectorItem;
