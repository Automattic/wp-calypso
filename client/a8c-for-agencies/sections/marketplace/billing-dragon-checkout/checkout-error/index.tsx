import { TranslateResult } from 'i18n-calypso';

import './style.scss';

type Props = {
	title: TranslateResult;
	message: TranslateResult;
};

export default function ClientCheckoutError( { title, message }: Props ) {
	return (
		<div className="client-checkout">
			<div className="client-checkout__error">
				<h2>{ title }</h2>
				<p>{ message }</p>
			</div>
		</div>
	);
}
