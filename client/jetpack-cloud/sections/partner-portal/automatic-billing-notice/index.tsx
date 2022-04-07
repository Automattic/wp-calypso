import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { ReactElement } from 'react';

import './style.scss';

interface Props {
	className?: string;
}

export default function AutomaticBillingNotice( { className = '' }: Props ): ReactElement {
	const translate = useTranslate();

	return (
		<p className={ classnames( 'automatic-billing-notice', className ) }>
			<small>
				{ translate(
					'Your primary payment method will be automatically charged for your monthly invoices.'
				) }
			</small>
		</p>
	);
}
