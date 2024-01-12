import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import CardHeading from 'calypso/components/card-heading';
import Layout from '../layout';
import LayoutHeader from '../layout/header';
import LayoutTop from '../layout/top';

import './styles.scss';

export default function PaymentMethodListV2() {
	const translate = useTranslate();

	const title = translate( 'Payment Methods' );
	const subtitle = translate(
		"Add a payment method to issue licenses. It's auto-charged monthly."
	);

	return (
		<Layout className="payment-method-list" title={ title } wide>
			<LayoutTop>
				<LayoutHeader>
					<CardHeading size={ 36 }>{ title }</CardHeading>
					<Button href="/partner-portal/payment-methods/add" primary>
						{ translate( 'Add new card' ) }
					</Button>
				</LayoutHeader>
				<p className="payment-method-list__description">{ subtitle }</p>
			</LayoutTop>
		</Layout>
	);
}
