/**
 * External dependencies
 */
import classnames from 'classnames';
import { isString, isArray } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './style.scss';
import Tooltip from '../tooltip';
import Button from '../button';
import Dashicon from '../dashicon';

// This is intentionally a Component class, not a function component because it
// is common to apply a ref to the button element (only supported in class)
class IconButton extends Component {
	render() {
		const { icon, children, label, className, tooltip, focus, shortcut, ...additionalProps } = this.props;
		const classes = classnames( 'components-icon-button', className );
		const tooltipText = tooltip || label;

		// Should show the tooltip if...
		const showTooltip = (
			// an explicit tooltip is passed or...
			tooltip ||
			// there's a shortcut or...
			shortcut ||
			(
				// there's a label and...
				!! label &&
				// the children are empty and...
				( ! children || ( isArray( children ) && ! children.length ) ) &&
				// the tooltip is not explicitly disabled.
				false !== tooltip
			)
		);

		let element = (
			<Button { ...additionalProps } aria-label={ label } className={ classes } focus={ focus }>
				{ isString( icon ) ? <Dashicon icon={ icon } /> : icon }
				{ children }
			</Button>
		);

		if ( showTooltip ) {
			element = (
				<Tooltip text={ tooltipText } shortcut={ shortcut }>
					{ element }
				</Tooltip>
			);
		}

		return element;
	}
}

export default IconButton;
