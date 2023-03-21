import { ConfettiAnimation, Spinner } from '@automattic/components';
import { Button, Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useGetDomainsQuery } from 'calypso/data/domains/use-get-domains-query';
import { omitUrlParams } from 'calypso/lib/url';
import { createSiteDomainObject } from 'calypso/state/sites/domains/assembler';

import './celebrate-launch-modal.scss';

function CelebrateLaunchModal( { setModalIsOpen, site } ) {
	const translate = useTranslate();
	const isPaidPlan = ! site?.plan?.is_free;
	const { data: allDomains = [], isFetching } = useGetDomainsQuery( site?.ID ?? null, {
		retry: false,
	} );

	const domains = allDomains.map( createSiteDomainObject );
	const hasCustomDomain = Boolean( domains.find( ( domain ) => ! domain.isWPCOMDomain ) );

	useEffect( () => {
		// remove the celebrateLaunch URL param without reloading the page as soon as the modal loads
		// make sure the modal is shown only once
		window.history.replaceState(
			null,
			'',
			omitUrlParams( window.location.href, 'celebrateLaunch' )
		);
	}, [] );

	let upsellHeading = translate( 'Free One-Year Domain' );
	let upsellBody = translate( 'Get a custom domain by upgrading your plan.' );

	if ( isPaidPlan && hasCustomDomain ) {
		upsellHeading = 'Upsell something else';
		upsellBody = 'Placeholder to upsell something else';
	} else if ( isPaidPlan && ! hasCustomDomain ) {
		upsellHeading = 'Claim your free domain';
		upsellBody = 'Your plan includes a free domain for the first year';
	}

	return (
		<Modal onRequestClose={ () => setModalIsOpen( false ) } className="launched__modal">
			<ConfettiAnimation />
			<div className="launched__modal-content">
				<div className="launched__modal-text">
					<h1 className="launched__modal-heading">
						{ translate( 'Congrats, your site is live!' ) }
					</h1>
					<p className="launched__modal-body">
						{ translate( 'Now you can head over to your site and share it with the world.' ) }
					</p>
				</div>
				<div className="launched__modal-actions">
					<div className="launched__modal-site">
						<p className="launched__modal-domain">{ site.slug }</p>

						<Button href={ site.URL } target="_blank">
							{ translate( 'View site' ) }
						</Button>
					</div>
				</div>
			</div>
			<div className="launched__modal-upsell">
				{ isFetching ? (
					<Spinner />
				) : (
					<>
						<div className="launched__modal-upsell-content">
							{ upsellHeading && (
								<h2 className="launched__modal-upsell-heading">{ upsellHeading }</h2>
							) }
							<p className="launched__modal-upsell-body">{ upsellBody }</p>
						</div>
						<Button isPrimary href={ `/domains/add/${ site.slug }` }>
							<span>{ translate( 'Choose a domain' ) }</span>
						</Button>
					</>
				) }
			</div>
		</Modal>
	);
}

export default CelebrateLaunchModal;
