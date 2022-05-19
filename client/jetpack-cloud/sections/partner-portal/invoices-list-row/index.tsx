import { Card } from '@automattic/components';
import classnames from 'classnames';
import { memo } from 'react';
import type { ReactNode, ReactElement } from 'react';

import './style.scss';

interface Props {
	header?: boolean;
	children: ReactNode;
}

function InvoicesListRow( { header, children }: Props ): ReactElement {
	return (
		<Card
			compact
			className={ classnames( {
				'invoices-list-row': true,
				'invoices-list-row--header': header,
			} ) }
		>
			<div className="invoices-list-row__content">{ children }</div>
		</Card>
	);
}

export default memo( InvoicesListRow );
