import page from '@automattic/calypso-router';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import getKeyboardHandler from '../../../lib/get-keyboard-handler';

const TableRow = ( { className, isHeader, href, children, ...props } ) => {
	const rowClasses = clsx( 'table-row', className, {
		'is-header': isHeader,
	} );

	if ( ! href ) {
		return (
			<tr className={ rowClasses } { ...props }>
				{ children }
			</tr>
		);
	}

	const goToHref = () => {
		page( href );
	};

	return (
		<tr
			className={ rowClasses + ' has-action' }
			role="button"
			tabIndex="0"
			onClick={ goToHref }
			onKeyDown={ getKeyboardHandler( goToHref ) }
			{ ...props }
		>
			{ children }
		</tr>
	);
};

TableRow.propTypes = {
	className: PropTypes.string,
	href: PropTypes.string,
	isHeader: PropTypes.bool,
};

export default TableRow;
