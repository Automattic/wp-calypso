import { Gridicon, ConfettiAnimation } from '@automattic/components';
import { Button, Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState, useRef } from 'react';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import Tooltip from 'calypso/components/tooltip';
import { omitUrlParams } from 'calypso/lib/url';
import { createSiteDomainObject } from 'calypso/state/sites/domains/assembler';

import './celebrate-launch-modal.scss';

function CelebrateLaunchModal( { setModalIsOpen, site, allDomains } ) {
	const translate = useTranslate();
	const isPaidPlan = ! site?.plan?.is_free;
	const isBilledYearly = site?.plan?.billing_period === 'Yearly';

	const transformedDomains = allDomains.map( createSiteDomainObject );
	const [ clipboardCopied, setClipboardCopied ] = useState( false );
	const clipboardButtonEl = useRef( null );
	const hasCustomDomain = Boolean(
		transformedDomains.find( ( domain ) => ! domain.isWPCOMDomain )
	);

	useEffect( () => {
		// remove the celebrateLaunch URL param without reloading the page as soon as the modal loads
		// make sure the modal is shown only once
		window.history.replaceState(
			null,
			'',
			omitUrlParams( window.location.href, 'celebrateLaunch' )
		);
	}, [] );

	function renderUpsellContent() {
		let contentElement;
		let buttonText;
		let buttonHref;

		if ( ! isPaidPlan && ! hasCustomDomain ) {
			contentElement = (
				<p>
					{ translate(
						'Supercharge your website with a {{strong}}custom address{{/strong}} that matches your blog, brand, or business.',
						{ components: { strong: <strong /> } }
					) }
				</p>
			);
			buttonText = translate( 'Claim your domain' );
			buttonHref = `/domains/add/${ site.slug }`;
		} else if ( isPaidPlan && isBilledYearly && ! hasCustomDomain ) {
			contentElement = (
				<p>
					{ translate(
						'Your paid plan includes a domain name {{strong}}free for one year{{/strong}}. Choose one that’s easy to remember and even easier to share.',
						{ components: { strong: <strong /> } }
					) }
				</p>
			);
			buttonText = translate( 'Claim your free domain' );
			buttonHref = `/domains/add/${ site.slug }`;
		} else if ( isPaidPlan && ! hasCustomDomain ) {
			contentElement = (
				<p>
					{ translate(
						'Interested in a custom domain? It’s free for the first year when you switch to annual billing.'
					) }
				</p>
			);
			buttonText = translate( 'Claim your domain' );
			buttonHref = `/domains/add/${ site.slug }`;
		} else if ( isPaidPlan && hasCustomDomain ) {
			return null;
		}

		return (
			<div className="launched__modal-upsell">
				<p className="launched__modal-upsell-content">{ contentElement }</p>
				<Button isLarge isPrimary href={ buttonHref }>
					<span>{ buttonText }</span>
				</Button>
			</div>
		);
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
						<div className="launched__modal-domain">
							<p className="launched__modal-domain-text">{ site.slug }</p>
							<ClipboardButton
								aria-label={ translate( 'Copy URL' ) }
								text={ site.slug }
								className="launchpad__clipboard-button"
								borderless
								compact
								onCopy={ () => setClipboardCopied( true ) }
								onMouseLeave={ () => setClipboardCopied( false ) }
								ref={ clipboardButtonEl }
							>
								<Gridicon icon="clipboard" />
							</ClipboardButton>
							<Tooltip
								context={ clipboardButtonEl.current }
								isVisible={ clipboardCopied }
								position="top"
							>
								{ translate( 'Copied to clipboard!' ) }
							</Tooltip>
						</div>

						<Button href={ site.URL } target="_blank" className="launched__modal-view-site">
							<Gridicon icon="domains" size={ 18 } />
							<span className="launched__modal-view-site-text">{ translate( 'View site' ) }</span>
						</Button>
					</div>
				</div>
			</div>
			{ renderUpsellContent() }
		</Modal>
	);
}

export default CelebrateLaunchModal;
