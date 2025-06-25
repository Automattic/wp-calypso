import { TranslateResult } from 'i18n-calypso';

import './style.scss';

type Props = {
	title: TranslateResult;
	message: TranslateResult;
};

export default function ClientCheckoutV2Error( { title, message }: Props ) {
	return (
		<div className="client-checkout-v2">
			<div className="client-checkout-v2__error">
				<h2>{ title }</h2>
				<p>{ message }</p>
			</div>
		</div>
	);
}
