import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

import './style.scss';

export default function DomainUpsell() {
	const translate = useTranslate();
	const siteSlug = useSelector( ( state ) => getSelectedSiteSlug( state ) );

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
							<strike>{ siteSlug }</strike>
						</span>
						<div className="badge badge--info">Current</div>
					</div>
					<div className="card">
						<span>{ siteSlug }</span>
						<div className="badge badge--success">Available</div>
					</div>
				</div>

				<div className="domain-upsell-actions">
					<a className="button" href={ '/domains/add/' + siteSlug }>
						{ translate( 'Search a domain' ) }
					</a>
					<a className="button is-primary" href={ '/plans/' + siteSlug }>
						{ translate( 'Get your custom domain' ) }
					</a>
				</div>
			</div>
		</Card>
	);
}
