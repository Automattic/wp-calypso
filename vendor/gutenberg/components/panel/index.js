/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import './style.scss';
import PanelHeader from './header';

function Panel( { header, className, children } ) {
	const classNames = classnames( className, 'components-panel' );
	return (
		<div className={ classNames }>
			{ header && <PanelHeader label={ header } /> }
			{ children }
		</div>
	);
}

export default Panel;
