/**
 * External dependencies
 */
import classnames from 'classnames';

export default function Row( { children, className } ) {
	return <div className={ classnames( 'tiled-gallery__row', className ) }>{ children }</div>;
}
