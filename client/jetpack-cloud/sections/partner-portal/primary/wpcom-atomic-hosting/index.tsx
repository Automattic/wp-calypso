import { useTranslate } from 'i18n-calypso';
import CardHeading from 'calypso/components/card-heading';
import Layout from '../../layout';
import LayoutHeader from '../../layout/header';

export default function WPCOMAtomicHosting() {
	const translate = useTranslate();
	const title = translate( 'Create a new WordPress.com site' );
	return (
		<Layout title={ title } wide>
			<LayoutHeader>
				<CardHeading size={ 36 }>{ title }</CardHeading>
			</LayoutHeader>
		</Layout>
	);
}
