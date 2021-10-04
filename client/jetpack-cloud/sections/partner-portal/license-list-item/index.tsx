import { CompactCard } from '@automattic/components';
import classnames from 'classnames';
import { ReactElement } from 'react';
import * as React from 'react';
import './style.scss';

interface Props {
	header?: boolean;
	className?: string;
}

export default function LicenseListItem( {
	header = false,
	className = '',
	children,
}: React.PropsWithChildren< Props > ): ReactElement {
	return (
		<CompactCard className={ className }>
			<div
				className={ classnames( {
					'license-list-item': true,
					'license-list-item--header': header,
				} ) }
			>
				{ children }
			</div>
		</CompactCard>
	);
}
