/* eslint-disable wpcalypso/jsx-gridicon-size */
import { Card, Gridicon } from '@automattic/components';
import { CardBody } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import CardHeading from 'calypso/components/card-heading';

import './style.scss';

export default function SiteWpAdminCard() {
	const translate = useTranslate();
	return (
		<Card className="sitewpadmin-card">
			<Gridicon icon="my-sites" size={ 32 } />
			<CardHeading id="sitewpadmin-card" size={ 20 }>
				{ translate( 'Switch to wp-admin' ) }
			</CardHeading>
			<CardBody>
				<p>{ translate( 'Switch your site interface and navigation to wp-admin.' ) }</p>
			</CardBody>
		</Card>
	);
}
