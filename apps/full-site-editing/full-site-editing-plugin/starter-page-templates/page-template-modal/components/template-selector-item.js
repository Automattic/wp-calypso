/**
 * External dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { isNil, get } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { Disabled, Spinner } from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
/* eslint-enable import/no-extraneous-dependencies */

/**
 * Internal dependencies
 */
import BlockPreview from './block-template-preview';
import { getBlocksByTemplateSlug, getTemplateBySlug } from '../utils/templates-parser';

const TemplateSelectorItem = props => {
	const {
		id,
		value,
		onSelect,
		label,
		useDynamicPreview,
		staticPreviewImg,
		staticPreviewImgAlt = '',
		isSelected,
		handleTemplateConfirmation,
	} = props;
	const template = getTemplateBySlug( value );
	const [ isParsing, setIsParsing ] = useState( true );

	const onTemplatesParseListener = event => {
		const parsedTemplate = get( event, [ 'detail', 'template' ] );
		if ( value !== parsedTemplate.slug ) {
			return;
		}
		setIsParsing( false );
	};
	window.addEventListener( 'onTemplateParse', onTemplatesParseListener );

	useEffect( () => {
		return () => {
			window.removeEventListener( 'resize', onTemplatesParseListener );
		};
	}, [] );

	if ( isNil( id ) || isNil( label ) || isNil( value ) ) {
		return null;
	}

	const { isEmpty } = template;

	const renderInnerPreview = () => {
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		if ( isParsing && ! isEmpty ) {
			return (
				<div className="editor-styles-wrapper">
					<div className="template-selector-item__preview-wrap is-parsing">
						<Spinner />;
					</div>
				</div>
			);
		}
		/* eslint-enable wpcalypso/jsx-classname-namespace */

		if ( useDynamicPreview ) {
			return (
				<Disabled>
					<BlockPreview blocks={ getBlocksByTemplateSlug( value ) } viewportWidth={ 960 } />
				</Disabled>
			);
		}

		return (
			<div className="template-selector-item__preview-wrap">
				<img
					className="template-selector-item__media"
					src={ staticPreviewImg }
					alt={ staticPreviewImgAlt }
				/>
			</div>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	};

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
			className={ classnames( 'template-selector-item__label', {
				'is-selected': isSelected,
				'is-parsing': isParsing,
			} ) }
			value={ value }
			onClick={ handleLabelClick }
			aria-labelledby={ `${ id } ${ labelId }` }
		>
			{ renderInnerPreview() }
			<span className="template-selector-item__template-title" id={ labelId }>
				{ label }
			</span>
		</button>
	);
};

export default TemplateSelectorItem;
