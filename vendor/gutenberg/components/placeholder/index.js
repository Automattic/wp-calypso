/**
 * External dependencies
 */
import classnames from 'classnames';
import { isString } from 'lodash';

/**
 * Internal dependencies
 */
import './style.scss';
import Dashicon from '../dashicon';

/**
* Renders a placeholder. Normally used by blocks to render their empty state.
*
* @param  {Object} props The component props.
* @return {Object}       The rendered placeholder.
*/
function Placeholder( { icon, children, label, instructions, className, notices, ...additionalProps } ) {
	const classes = classnames( 'components-placeholder', className );

	return (
		<div { ...additionalProps } className={ classes }>
			{ notices }
			<div className="components-placeholder__label">
				{ isString( icon ) ? <Dashicon icon={ icon } /> : icon }
				{ label }
			</div>
			{ !! instructions && <div className="components-placeholder__instructions">{ instructions }</div> }
			<div className="components-placeholder__fieldset">
				{ children }
			</div>
		</div>
	);
}

export default Placeholder;
