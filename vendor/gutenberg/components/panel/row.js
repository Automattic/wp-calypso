/**
 * External dependencies
 */
import classnames from 'classnames';

function PanelRow( { className, children } ) {
	const classes = classnames( 'components-panel__row', className );

	return (
		<div className={ classes }>
			{ children }
		</div>
	);
}

export default PanelRow;
