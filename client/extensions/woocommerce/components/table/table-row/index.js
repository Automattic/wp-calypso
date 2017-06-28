/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classnames from 'classnames';
import page from 'page';

/**
 * Internal dependencies
 */
import onKeyDownCallback from 'woocommerce/lib/keydown-callback';

const TableRow = ( { className, isHeader, href, children, ...props } ) => {
	const rowClasses = classnames( 'table-row', className, {
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
			onKeyDown={ onKeyDownCallback( goToHref ) }
			{ ...props }>
			{ children }
		</tr>
	);
};

TableRow.propTypes = {
	children: PropTypes.node,
	className: PropTypes.string,
	href: PropTypes.string,
	isHeader: PropTypes.bool,
};

export default TableRow;
