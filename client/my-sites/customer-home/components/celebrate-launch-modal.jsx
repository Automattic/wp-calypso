import { Gridicon, ConfettiAnimation, Tooltip } from '@automattic/components';
import { Button, Modal } from '@wordpress/components';
import { Icon, copy } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import { isA4APurchase } from 'calypso/lib/purchases';
import { omitUrlParams } from 'calypso/lib/url';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { fetchSitePurchases } from 'calypso/state/purchases/actions';
import { getSitePurchases, isFetchingSitePurchases } from 'calypso/state/purchases/selectors';
import { createSiteDomainObject } from 'calypso/state/sites/domains/assembler';
import { getSitePlanSlug } from 'calypso/state/sites/plans/selectors';

import './celebrate-launch-modal.scss';

function CelebrateLaunchModal( { setModalIsOpen, site, allDomains } ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const isPaidPlan = ! site?.plan?.is_free;
	const isBilledMonthly = site?.plan?.product_slug?.includes( 'monthly' );
	const transformedDomains = allDomains.map( createSiteDomainObject );
	const [ isInitiallyLoaded, setIsInitiallyLoaded ] = useState( false );
	const [ clipboardCopied, setClipboardCopied ] = useState( false );
	const clipboardButtonEl = useRef( null );
	const hasCustomDomain = Boolean(
		transformedDomains.find( ( domain ) => ! domain.isWPCOMDomain )
	);
	const sitePlanSlug = useSelector( ( state ) => getSitePlanSlug( state, site?.ID ) );
	const purchases = useSelector( ( state ) => getSitePurchases( state, site?.ID ) );
	const actualPlanPurchase = purchases.filter(
		( purchase ) => purchase.productSlug === sitePlanSlug
	);
	const isA4ASite = isA4APurchase( actualPlanPurchase[ 0 ] );
	const isLoading = useSelector( isFetchingSitePurchases );

	useEffect( () => {
		// Remove the celebrateLaunch URL param without reloading the page as soon as the modal loads
		// Make sure the modal is shown only once
		window.history.replaceState(
			null,
			'',
			omitUrlParams( window.location.href, 'celebrateLaunch' )
		);

		dispatch(
			recordTracksEvent( 'calypso_launchpad_celebration_modal_view', {
				product_slug: site?.plan?.product_slug,
			} )
		);
	}, [] );

	useEffect( () => {
		dispatch( fetchSitePurchases( site?.ID ) );
	}, [ dispatch, site?.ID ] );

	useEffect( () => {
		if ( ! isLoading && ( ! isPaidPlan || purchases.length > 0 ) && ! isInitiallyLoaded ) {
			setIsInitiallyLoaded( true );
		}
	}, [ isLoading, purchases, isPaidPlan ] );

	function renderUpsellContent() {
		let contentElement;
		let buttonText;
		let buttonHref;

		if ( ( ! isPaidPlan && ! hasCustomDomain ) || isA4ASite ) {
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
		} else if ( isPaidPlan && isBilledMonthly && ! hasCustomDomain ) {
			contentElement = (
				<p>
					{ translate(
						'Interested in a custom domain? It’s free for the first year when you switch to annual billing.'
					) }
				</p>
			);
			buttonText = translate( 'Claim your domain' );
			buttonHref = `/domains/add/${ site.slug }`;
		} else if ( isPaidPlan && ! hasCustomDomain && ! isA4ASite ) {
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
		} else if ( hasCustomDomain ) {
			return null;
		}

		return (
			<div className="launched__modal-upsell">
				<div className="launched__modal-upsell-content">{ contentElement }</div>
				<Button
					isLarge
					isPrimary
					href={ buttonHref }
					onClick={ () =>
						dispatch(
							recordTracksEvent( 'calypso_launchpad_celebration_modal_upsell_clicked', {
								product_slug: site?.plan?.product_slug,
							} )
						)
					}
				>
					<span>{ buttonText }</span>
				</Button>
			</div>
		);
	}

	if ( ! isInitiallyLoaded ) {
		return null;
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
								<Icon icon={ copy } size={ 18 } />
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
