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

				<div className="suggested-domain-name">
					<div className="card">
						<span>
							<strike>simplefree512.wordpress.com</strike>
						</span>
						<div className="badge badge--info">Current</div>
					</div>
					<div className="card">
						<span>simplefree512.wpcomstaging.com</span>
						<div className="badge badge--success">Available</div>
					</div>
				</div>

				<div className="domain-upsell-actions">
					<button type="button" className="button">
						{ translate( 'Search a domain' ) }
					</button>
					<button type="button" className="button is-primary">
						{ translate( 'Get your custom domain' ) }
					</button>
				</div>
			</div>
		</Card>
	);
}
