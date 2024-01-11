import { useTranslate } from 'i18n-calypso';
import Layout from 'calypso/jetpack-cloud/components/layout';
import LayoutHeader, {
	LayoutHeaderSubtitle as Subtitle,
	LayoutHeaderTitle as Title,
	LayoutHeaderBreadcrumb as Breadcrumb,
} from 'calypso/jetpack-cloud/components/layout/header';
import LayoutTop from 'calypso/jetpack-cloud/components/layout/top';

export default function PaymentMethodListV2() {
	const translate = useTranslate();

	const title = translate( 'Add new card' );
	const subtitle = translate( 'You will only be charged for paid licenses you issue.' );

	return (
		<Layout className="payment-method-add" title={ title } wide>
			<LayoutTop>
				<LayoutHeader>
					<Breadcrumb
						items={ [
							{ label: translate( 'Payment Methods' ), href: '/partner-portal/payment-methods' },
							{ label: translate( 'Add new card' ) },
						] }
					/>
					<Title>{ title } </Title>
					<Subtitle>{ subtitle }</Subtitle>
				</LayoutHeader>
			</LayoutTop>
		</Layout>
	);
}
