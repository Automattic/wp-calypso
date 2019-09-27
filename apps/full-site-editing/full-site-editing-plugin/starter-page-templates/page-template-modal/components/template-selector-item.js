/**
 * External dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { isNil, isEmpty } from 'lodash';
/* eslint-enable import/no-extraneous-dependencies */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { Disabled, Spinner } from '@wordpress/components';

/**
 * Internal dependencies
 */
import BlockPreview from './block-template-preview';

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
		isParsing,
	} = props;

	if ( isNil( id ) || isNil( label ) || isNil( value ) ) {
		return null;
	}

	const renderInnerPreview = () => {
		if ( isParsing ) {
			return (
				<div className="template-selector-item__preview-wrap is-parsing">
					<Spinner />;
				</div>
			);
		}

		if ( useDynamicPreview ) {
			return (
				<Disabled>
					<BlockPreview blocks={blocks} viewportWidth={960}/>
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
