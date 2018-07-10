/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import './style.scss';
import { Dashicon } from '@wordpress/components';
import { createElement, Component } from '@wordpress/element';

function renderIcon( icon ) {
	if ( 'string' === typeof icon ) {
		return <Dashicon icon={ icon } />;
	} else if ( 'function' === typeof icon ) {
		if ( icon.prototype instanceof Component ) {
			return createElement( icon );
		}

		return icon();
	}

	return icon || null;
}

export default function BlockIcon( { icon, showColors = false, className } ) {
	const renderedIcon = renderIcon( icon && icon.src ? icon.src : icon );
	if ( showColors ) {
		return (
			<div
				style={ {
					backgroundColor: icon && icon.background,
					color: icon && icon.foreground,
				} }
				className={ classnames( 'editor-block-icon__colors', className ) }
			>
				{ renderedIcon }
			</div>
		);
	}
	return renderedIcon;
}
