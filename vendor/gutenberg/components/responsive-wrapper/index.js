/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress Dependencies
 */
import { cloneElement, Children } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './style.scss';

function ResponsiveWrapper( { naturalWidth, naturalHeight, children } ) {
	if ( Children.count( children ) !== 1 ) {
		return null;
	}
	const imageStyle = {
		paddingBottom: ( naturalHeight / naturalWidth * 100 ) + '%',
	};
	return (
		<div className="components-responsive-wrapper">
			<div style={ imageStyle } />
			{ cloneElement( children, {
				className: classnames( 'components-responsive-wrapper__content', children.props.className ),
			} ) }
		</div>
	);
}

export default ResponsiveWrapper;
