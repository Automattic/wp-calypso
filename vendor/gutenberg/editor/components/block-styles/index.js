/**
 * External dependencies
 */
import { find, compact, get } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { compose } from '@wordpress/element';
import { withSelect, withDispatch } from '@wordpress/data';
import { getBlockType } from '@wordpress/blocks';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './style.scss';
import { BlockPreviewContent } from '../block-preview';

/**
 * Returns the active style from the given className.
 *
 * @param {Array} styles Block style variations.
 * @param {string} className  Class name
 *
 * @return {Object?} The active style.
 */
export function getActiveStyle( styles, className ) {
	let activeStyle;
	className
		.split( ' ' )
		.map( ( current ) => current.trim() )
		.filter( ( current ) => current.indexOf( 'is-style-' ) === 0 )
		.forEach( ( current ) => {
			if ( activeStyle ) {
				return;
			}
			const potentialStyleName = current.substring( 9 );
			activeStyle = find( styles, ( style ) => style.name === potentialStyleName );
		} );
	if ( ! activeStyle ) {
		activeStyle = find( styles, ( style ) => style.isDefault );
	}

	return activeStyle;
}

/**
 * Replaces the active style in the block's className.
 *
 * @param {string}  className   Class name.
 * @param {Object?} activeStyle The replaced style.
 * @param {Object}  newStyle    The replacing style.
 *
 * @return {string} The updated className.
 */
export function replaceActiveStyle( className, activeStyle, newStyle ) {
	let added = false;
	let updatedClassName = compact( className
		.split( ' ' )
		.map( ( current ) => {
			const trimmed = current.trim();
			if ( activeStyle && trimmed === 'is-style-' + activeStyle.name ) {
				added = true;
				return newStyle.isDefault ? null : 'is-style-' + newStyle.name;
			}
			return trimmed;
		} ) ).join( ' ' );
	if ( ! added && ! newStyle.isDefault ) {
		updatedClassName = updatedClassName + ' is-style-' + newStyle.name;
	}

	return updatedClassName;
}

function BlockStyles( {
	styles,
	className,
	onChangeClassName,
	name,
	attributes,
	onSwitch,
	onHoverClassName,
} ) {
	if ( ! styles ) {
		return null;
	}

	const activeStyle = getActiveStyle( styles, className );
	function updateClassName( style ) {
		const updatedClassName = replaceActiveStyle( className, activeStyle, style );
		onChangeClassName( updatedClassName );
		onSwitch();
	}

	return (
		<div className="editor-block-styles">
			{ styles.map( ( style ) => {
				const styleClassName = replaceActiveStyle( className, activeStyle, style );
				/* eslint-disable jsx-a11y/click-events-have-key-events */
				return (
					<div
						key={ style.name }
						className={ classnames(
							'editor-block-styles__item', {
								'is-active': activeStyle === style,
							}
						) }
						onClick={ () => updateClassName( style ) }
						onMouseEnter={ () => onHoverClassName( styleClassName ) }
						onMouseLeave={ () => onHoverClassName( null ) }
						role="button"
						tabIndex="0"
						aria-label={ sprintf( __( 'Apply style variation "%s"' ), style.label || style.name ) }
					>
						<div className="editor-block-styles__item-preview">
							<BlockPreviewContent
								name={ name }
								attributes={ {
									...attributes,
									className: styleClassName,
								} }
							/>
						</div>
						<div className="editor-block-styles__item-label">
							{ style.label || style.name }
						</div>
					</div>
				);
				/* eslint-enable jsx-a11y/click-events-have-key-events */
			} ) }
		</div>
	);
}

export default compose( [
	withSelect( ( select, { uid } ) => {
		const block = select( 'core/editor' ).getBlock( uid );

		return {
			name: block.name,
			attributes: block.attributes,
			className: block.attributes.className || '',
			styles: get( getBlockType( block.name ), [ 'styles' ] ),
		};
	} ),
	withDispatch( ( dispatch, { uid } ) => {
		return {
			onChangeClassName( newClassName ) {
				dispatch( 'core/editor' ).updateBlockAttributes( uid, { className: newClassName } );
			},
		};
	} ),
] )( BlockStyles );
