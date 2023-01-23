import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

export default function DomainUpsell() {
	const translate = useTranslate();

	return (
		<Card className="domain-upsell__card customer-home__card">
			<div>
				<h3>{ translate( 'Own your online identity with a custom domain' ) }</h3>
				<p>
					{ translate(
						"Find the perfect domain name and stake your claim on your corner of the web with a site address that's easy to find, share, and follow."
					) }
				</p>

				<div className="eligibility-warnings__domain-names">
					<div className="card is-compact">
						<span>simplefree512.wordpress.com</span>
						<div className="badge badge--info">current</div>
					</div>
					<div className="card is-compact">
						<span>simplefree512.wpcomstaging.com</span>
						<div className="badge badge--success">new</div>
					</div>
				</div>
				<button type="button" className="button">
					{ translate( 'Search a domain' ) }
				</button>
				<button type="button" className="button is-primary">
					{ translate( 'Get your custom domain' ) }
				</button>
			</div>
		</Card>
	);
}
