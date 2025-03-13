import { getPlan, PLAN_BUSINESS, PLAN_ECOMMERCE } from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { Plans } from '@automattic/data-stores';
import { Modal, Button } from '@wordpress/components';
import { useCallback, useMemo, useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import Notice from 'calypso/components/notice';
import { hasAmountAvailableToRefund } from 'calypso/lib/purchases';
import { cancelAndRefundPurchaseAsync } from 'calypso/lib/purchases/actions';
import getPlanFeatures from 'calypso/my-sites/checkout/src/lib/get-plan-features';
import { useSelector, useDispatch } from 'calypso/state';
import { closeDowngradeModal } from 'calypso/state/downgrade-modal/actions';
import {
	getDowngradeModalToPlanSlug,
	isDowngradeModalOpen,
} from 'calypso/state/downgrade-modal/selectors';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { getPurchases } from 'calypso/state/purchases/selectors';
import { refreshSitePlans } from 'calypso/state/sites/plans/actions';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

const DowngradeModal = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const isVisible = useSelector( isDowngradeModalOpen );
	const toPlanSlug = useSelector( getDowngradeModalToPlanSlug );
	const siteId = useSelector( getSelectedSiteId );
	const site = useSelector( ( state ) => getSite( state, siteId ) );
	const currentPlan = Plans.useCurrentPlan( { siteId } );
	const [ isDowngrading, setIsDowngrading ] = useState( false );

	// Check if the site is atomic and if the target plan is not a Business or Commerce plan
	const isAtomicSite = site?.options?.is_wpcom_atomic;
	const isTargetPlanNonAtomic = toPlanSlug !== PLAN_BUSINESS && toPlanSlug !== PLAN_ECOMMERCE;
	const shouldShowAtomicWarning = isAtomicSite && isTargetPlanNonAtomic;

	// Get all purchases to find the current plan purchase
	const allPurchases = useSelector( getPurchases );

	// Find the purchase that corresponds to the current plan
	const currentPlanPurchase = useMemo( () => {
		if ( ! currentPlan?.productSlug || ! siteId || ! allPurchases?.length ) {
			return null;
		}

		return allPurchases.find(
			( purchase ) => purchase.siteId === siteId && purchase.productSlug === currentPlan.productSlug
		);
	}, [ allPurchases, currentPlan?.productSlug, siteId ] );

	const handleClose = useCallback( () => {
		if ( isDowngrading ) {
			return;
		}
		dispatch( closeDowngradeModal() );
	}, [ dispatch, isDowngrading ] );

	const handleDowngrade = useCallback( async () => {
		if ( ! currentPlan?.purchaseId || ! currentPlan?.productId || ! toPlanSlug || isDowngrading ) {
			return;
		}

		setIsDowngrading( true );

		try {
			const response = await cancelAndRefundPurchaseAsync( currentPlan.purchaseId, {
				product_id: currentPlan.productId,
				type: 'downgrade',
				to_product_id: getPlan( toPlanSlug )?.getProductId(),
			} );

			// Show success notification
			dispatch( successNotice( response.message, { duration: 5000 } ) );

			// Refresh site plans to update the UI with the new plan
			if ( siteId ) {
				dispatch( refreshSitePlans( siteId ) );
			}
		} catch ( error: unknown ) {
			if ( error instanceof Error ) {
				dispatch( errorNotice( error.message, { duration: 5000 } ) );
			} else {
				dispatch( errorNotice( translate( 'An unknown error occurred' ), { duration: 5000 } ) );
			}
		} finally {
			// Close the modal after all operations are complete
			setIsDowngrading( false );
			handleClose();
		}
	}, [ currentPlan, toPlanSlug, siteId, dispatch, translate, handleClose, isDowngrading ] );

	// Get features that will be lost when downgrading
	const lostFeatures = useMemo( () => {
		if ( ! currentPlan?.productSlug || ! toPlanSlug ) {
			return [];
		}

		// Get features for current plan
		const currentPlanFeatures = getPlanFeatures(
			{ product_slug: currentPlan.productSlug } as any,
			translate,
			false,
			false,
			false,
			true
		);

		// Get features for target plan
		const targetPlanFeatures = getPlanFeatures(
			{ product_slug: toPlanSlug } as any,
			translate,
			false,
			false,
			false,
			true
		);

		// Find features that are in current plan but not in target plan
		return currentPlanFeatures.filter( ( feature ) => ! targetPlanFeatures.includes( feature ) );
	}, [ currentPlan?.productSlug, toPlanSlug, translate ] );

	if ( ! isVisible ) {
		return null;
	}

	// Get the target plan name for the modal title
	const targetPlan = toPlanSlug ? getPlan( toPlanSlug ) : null;
	const targetPlanName = targetPlan?.getTitle() || toPlanSlug || '';
	const currentPlanObj = currentPlan?.productSlug ? getPlan( currentPlan.productSlug ) : null;
	const currentPlanName = currentPlanObj?.getTitle() || currentPlan?.productSlug || '';
	const modalTitle = translate( 'Back to plan %s', { args: [ targetPlanName ] } ) as string;

	return (
		<Modal title={ modalTitle } onRequestClose={ handleClose } overlayClassName="downgrade-modal">
			{ currentPlanPurchase && hasAmountAvailableToRefund( currentPlanPurchase ) && (
				<Notice
					className="downgrade-modal__notice"
					icon={ <Gridicon icon="info" /> }
					isCompact
					theme="light"
					status="is-info"
					showDismiss={ false }
				>
					<span className="downgrade-modal__notice-text">
						{ translate(
							'You will receive a refund for the price difference between your current plan and the downgraded plan.'
						) }
					</span>
				</Notice>
			) }

			{ shouldShowAtomicWarning && (
				<Notice
					className="downgrade-modal__notice"
					icon={ <Gridicon icon="notice-outline" /> }
					isCompact={ false }
					theme="light"
					status="is-warning"
					showDismiss={ false }
				>
					<div className="downgrade-modal__atomic-warning">
						<p>
							<strong>
								{ translate(
									'Your site is currently on a plan that supports plugins, third-party themes, and other advanced features. Downgrading from this plan means:'
								) }
							</strong>
						</p>
						<ul>
							<li>
								{ translate(
									'Your site will lose any plugins or third-party themes installed and features unavailable on the lower-level plan.'
								) }
							</li>
							<li>
								{ translate(
									'Your site will retain the content of your pages, posts, and media, but any content added through plugins will be lost.'
								) }
							</li>
							<li>
								{ translate(
									"Your site will revert to how it looked before you activated the plan's features."
								) }
							</li>
							<li>
								{ translate(
									'The site will be private, so you can check it before making it public on the new plan.'
								) }
							</li>
							<li>
								{ translate( 'Please contact support so we can help you with the downgrade.' ) }
							</li>
						</ul>
					</div>
				</Notice>
			) }

			<div className="downgrade-modal__info">
				<p>
					{ translate(
						'When you downgrade, your site will be immediately switched from %(currentPlanName)s to %(targetPlanName)s.',
						{
							args: {
								currentPlanName,
								targetPlanName,
							},
						}
					) }
				</p>
				<p>
					<strong>
						{ translate( 'You will lose access to the following benefits right away.' ) }
					</strong>
				</p>
			</div>

			{ lostFeatures.length > 0 && (
				<div className="downgrade-modal__lost-features">
					<ul>
						{ lostFeatures.map( ( feature, index ) => (
							<li key={ index }>
								<Gridicon icon="cross" size={ 18 } />
								{ feature }
							</li>
						) ) }
					</ul>
				</div>
			) }

			<div className="downgrade-modal__actions">
				<Button variant="secondary" onClick={ handleClose } disabled={ isDowngrading }>
					{ translate( 'Cancel' ) }
				</Button>
				<Button
					variant="primary"
					onClick={ handleDowngrade }
					isPrimary
					isBusy={ isDowngrading }
					disabled={ isDowngrading }
				>
					{ translate( 'Downgrade' ) }
				</Button>
			</div>
		</Modal>
	);
};

export default DowngradeModal;
