import { Card, Spinner } from '@automattic/components';
import { useDomainSuggestions } from '@automattic/domain-picker/src';
import { useLocale } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

import './style.scss';

export default function DomainUpsell() {
	const translate = useTranslate();
	const siteSlug = useSelector( ( state ) => getSelectedSiteSlug( state ) );
	const siteSubDomain = siteSlug.split( '.' )[ 0 ];
	const locale = useLocale();
	const { allDomainSuggestions } =
		useDomainSuggestions( siteSubDomain, 3, undefined, locale ) || {};

	// Get first non-free suggested domain.
	const domainSuggestion = allDomainSuggestions?.filter(
		( suggestion ) => ! suggestion.is_free
	)[ 0 ];

	// It takes awhile to suggest a domain name. Set a default to siteSubDomain.blog.
	const domainSuggestionName = domainSuggestion?.domain_name || siteSubDomain + '.blog';

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
						<span>{ domainSuggestionName }</span>
						{ domainSuggestion?.domain_name ? (
							<div className="badge badge--success">Available</div>
						) : (
							<div className="badge">
								<Spinner />
							</div>
						) }
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
