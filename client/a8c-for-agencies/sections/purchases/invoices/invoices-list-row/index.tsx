import { Card } from '@automattic/components';
import clsx from 'clsx';
import { memo } from 'react';
import type { PropsWithChildren } from 'react';

import './style.scss';

type Props = PropsWithChildren< {
	header?: boolean;
} >;

function InvoicesListRow( { header, children }: Props ) {
	return (
		<Card
			compact
			className={ clsx( 'invoices-list-row', {
				'invoices-list-row__header': header,
			} ) }
		>
			<div className="invoices-list-row__content">{ children }</div>
		</Card>
	);
}

export default memo( InvoicesListRow );
