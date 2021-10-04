import { Button, Card } from '@automattic/components';
import { __ } from '@wordpress/i18n';
import Badge from 'calypso/components/badge';
import CardHeading from 'calypso/components/card-heading';
import { INCOMING_DOMAIN_TRANSFER } from 'calypso/lib/url/support';

import './style.scss';

export default function DomainTransferRecommendation() {
	return (
		<Card className="domain-transfer-recommendation">
			<div className="domain-transfer-recommendation__content">
				<CardHeading size={ 16 }>
					{ __( 'Transfer your domain' ) }
					<Badge type="info-green">{ __( 'Recommended' ) }</Badge>
				</CardHeading>
				<span className="domain-transfer-recommendation__message">
					{ __(
						'We recommend transferring your domain to manage your domain and site directly on WordPress.com'
					) }
				</span>
			</div>
			<Button
				className="domain-transfer-recommendation__action"
				href={ INCOMING_DOMAIN_TRANSFER }
				compact
			>
				{ __( 'Transfer instead' ) }
			</Button>
		</Card>
	);
}
