import { getPlan, PLAN_BUSINESS, PLAN_ECOMMERCE } from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { Plans } from '@automattic/data-stores';
import { Modal, Button, CheckboxControl } from '@wordpress/components';
import { useCallback, useMemo, useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import Notice from 'calypso/components/notice';
import { useExperiment } from 'calypso/lib/explat';
import { hasAmountAvailableToRefund } from 'calypso/lib/purchases';
import { cancelAndRefundPurchaseAsync } from 'calypso/lib/purchases/actions';
import getPlanFeatures from 'calypso/my-sites/checkout/src/lib/get-plan-features';
import { useSelector, useDispatch } from 'calypso/state';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { fetchSitePurchases } from 'calypso/state/purchases/actions';
import { getPurchases } from 'calypso/state/purchases/selectors';
import { refreshSitePlans } from 'calypso/state/sites/plans/actions';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

interface DowngradeModalProps {
	isVisible: boolean;
	toPlanSlug: string | null;
	onClose: () => void;
}

const DowngradeModal = ( { isVisible, toPlanSlug, onClose }: DowngradeModalProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId );
	const site = useSelector( ( state ) => getSite( state, siteId ) );
	const currentPlan = Plans.useCurrentPlan( { siteId } );
	const [ isDowngrading, setIsDowngrading ] = useState( false );
	const [ enableLosslessImport, setEnableLosslessImport ] = useState( false );
	const [ , experimentAssignment ] = useExperiment( 'wpcom_business_10_01' );
	const shouldShowLosslessImportOption = experimentAssignment?.variationName === 'treatment';

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
		onClose();
	}, [ onClose, isDowngrading ] );

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
				lossless_revert: shouldShowAtomicWarning ? enableLosslessImport : undefined,
			} );

			// Show success notification
			dispatch( successNotice( response.message, { duration: 5000 } ) );

			// Refresh site plans and purchases to update the UI with the new plan
			if ( siteId ) {
				dispatch( refreshSitePlans( siteId ) );
				dispatch( fetchSitePurchases( siteId ) );
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
	}, [
		currentPlan,
		toPlanSlug,
		siteId,
		dispatch,
		translate,
		handleClose,
		isDowngrading,
		shouldShowAtomicWarning,
		enableLosslessImport,
	] );

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

			{ shouldShowAtomicWarning && (
				<>
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

					{ shouldShowLosslessImportOption && (
						<div className="downgrade-modal__lossless-import">
							<CheckboxControl
								label={ translate(
									'Attempt to recover my posts, pages, and media after downgrade'
								) }
								help={ translate(
									'Your posts, pages, and media added after upgrading will be automatically imported to your downgraded site. You will receive an email when complete.'
								) }
								checked={ enableLosslessImport }
								onChange={ setEnableLosslessImport }
							/>
						</div>
					) }
				</>
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
