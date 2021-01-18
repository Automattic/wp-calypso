/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	header?: boolean;
	className?: string;
}

export default function LicenseListItem( {
	header = false,
	className = '',
	children,
}: React.PropsWithChildren< Props > ) {
	return (
		<CompactCard className={ className }>
			<div
				className={ classnames( {
					'license-list-item': true,
					'license-list-item--header': !! header,
				} ) }
			>
				{ children }
			</div>
		</CompactCard>
	);
}
