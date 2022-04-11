import classnames from 'classnames';
import { ReactChild, ReactElement } from 'react';

import './style.scss';

interface Props {
	className?: string;
	text: ReactChild;
}

export default function AutomaticBillingNotice( { className = '', text }: Props ): ReactElement {
	return (
		<p className={ classnames( 'automatic-billing-notice', className ) }>
			<small>{ text }</small>
		</p>
	);
}
