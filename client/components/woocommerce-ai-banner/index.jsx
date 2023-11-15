import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

const WooCommerceAiBanner = () => {
	const translate = useTranslate();

	return (
		<div className="woocommerce-ai-banner">
			<h1>{ translate( 'Use the power of AI to create your store' ) }</h1>
			<p>
				{ translate(
					'Design the look of your store, create pages, and generate copy using our built-in AI tools.'
				) }
			</p>
			<Button>{ translate( 'Design with AI' ) }</Button>
		</div>
	);
};

export default WooCommerceAiBanner;
