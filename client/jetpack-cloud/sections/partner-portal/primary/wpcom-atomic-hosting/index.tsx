import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import CardHeading from 'calypso/components/card-heading';
import Layout from '../../layout';
import LayoutHeader from '../../layout/header';
import CardContent from './card-content';

import './style.scss';

export default function WPCOMAtomicHosting() {
	const translate = useTranslate();
	const title = translate( 'Create a new WordPress.com site' );

	const plansToBeDisplayed = [
		'JETPACK_HOSTING_WPCOM_BUSINESS',
		'JETPACK_HOSTING_WPCOM_ECOMMERCE',
	]; // Get the plans from the API

	return (
		<Layout title={ title } wide>
			<LayoutHeader>
				<CardHeading size={ 36 }>{ title }</CardHeading>
			</LayoutHeader>

			<div className="wpcom-atomic-hosting__card-container">
				{ plansToBeDisplayed.map( ( plan ) => (
					<Card key={ plan } className="wpcom-atomic-hosting__card" compact>
						<CardContent planSlug={ plan } />
					</Card>
				) ) }
			</div>
		</Layout>
	);
}
