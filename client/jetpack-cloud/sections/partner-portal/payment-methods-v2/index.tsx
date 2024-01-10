import { useTranslate } from 'i18n-calypso';
import Layout from 'calypso/jetpack-cloud/components/layout';
import LayoutHeader, {
	LayoutHeaderSubtitle as Subtitle,
	LayoutHeaderTitle as Title,
} from 'calypso/jetpack-cloud/components/layout/header';
import LayoutTop from 'calypso/jetpack-cloud/components/layout/top';

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
					<Title>{ title } </Title>
					<Subtitle>{ subtitle }</Subtitle>
				</LayoutHeader>
			</LayoutTop>
		</Layout>
	);
}
