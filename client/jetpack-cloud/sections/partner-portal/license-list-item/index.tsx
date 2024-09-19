import { CompactCard } from '@automattic/components';
import clsx from 'clsx';
import type { PropsWithChildren } from 'react';
import './style.scss';

interface Props {
	header?: boolean;
	className?: string;
}

export default function LicenseListItem( {
	header = false,
	className = '',
	children,
}: PropsWithChildren< Props > ) {
	return (
		<CompactCard className={ className }>
			<div
				className={ clsx( {
					'license-list-item': true,
					'license-list-item--header': header,
				} ) }
			>
				{ children }
			</div>
		</CompactCard>
	);
}
