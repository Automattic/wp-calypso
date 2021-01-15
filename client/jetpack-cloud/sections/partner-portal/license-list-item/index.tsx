/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	header?: boolean;
}

export default function LicenseListItem( {
	header = false,
	children,
}: React.PropsWithChildren< Props > ) {
	return (
		<div
			className={ classnames( {
				'license-list-item': true,
				'license-list-item--header': !! header,
			} ) }
		>
			{ children }
		</div>
	);
}
