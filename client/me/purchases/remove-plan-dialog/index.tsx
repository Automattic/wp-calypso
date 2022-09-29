import { Dialog, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { Fragment } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import { isRefundable } from 'calypso/lib/purchases';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { SiteScreenshot } from '../site-screenshot/';
import getPlanFeatures from './get-plan-features';
import './style.scss';

interface RemovePlanDialogProps {
	closeDialog: () => void;
	removePlan: () => void;
	isDialogVisible: boolean;
	isRemoving: boolean;
	site: SiteExcerptData;
	hasDomain: boolean;
	wpcomSiteURL: string;
}

export const RemovePlanDialog = ( {
	closeDialog,
	removePlan,
	isDialogVisible,
	site,
	hasDomain,
	wpcomSiteURL,
}: RemovePlanDialogProps ) => {
	const translate = useTranslate();
	const siteName = site.name ?? '';

	/**
	 * Istantiate site's plan variables.
	 */
	const productSlug = site.plan?.product_slug;
	const planLabel = site.plan?.product_name_short;
	const isComingSoon = site.is_coming_soon;
	const isPrivate = site.is_private;
	const launchedStatus = site.launch_status === 'launched' ? true : false;
	const shouldUseSiteThumbnail =
		isComingSoon === false && isPrivate === false && launchedStatus === true;
	const subTitle = ! isRefundable
		? translate( 'If you cancel your plan, once it expires, you will lose:' )
		: translate( 'If you cancel your plan, you will lose:' );

	/**
	 * Click events, buttons tracking and action.
	 */
	const clickRemovePlan = () => {
		recordTracksEvent( 'calypso_remove_purchase_cancellation_modal_remove_plan_click', {
			product_slug: productSlug,
		} );
		removePlan();
	};

	const clickCloseDialog = () => {
		recordTracksEvent( 'calypso_remove_purchase_cancellation_modal_cancel_click', {
			product_slug: productSlug,
		} );
		closeDialog();
	};

	/**
	 * Dialog buttons
	 */
	const buttons = [
		{
			action: 'remove',
			label: translate( 'Cancel my plan' ),
			onClick: clickRemovePlan,
		},
		{
			action: 'cancel',
			label: translate( 'Keep my plan' ),
			onClick: clickCloseDialog,
			isPrimary: true,
		},
	];

	/**
	 * Return the list of features that the user will lose by canceling their plan.
	 *
	 * @returns Fragment
	 */
	const FeaturesList = () => {
		if ( typeof productSlug === 'string' ) {
			const planFeatures = getPlanFeatures( productSlug, hasDomain, wpcomSiteURL );

			if ( planFeatures.length > 0 ) {
				const domainFeature =
					hasDomain && wpcomSiteURL ? (
						<p>
							{ translate(
								'Your custom domain as primary. Your traffic will be redirected to %(domain)s',
								{
									args: {
										domain: wpcomSiteURL,
									},
								}
							) }
						</p>
					) : null;
				return (
					<Fragment>
						<p>{ subTitle }</p>
						<ul className="remove-plan-dialog__list-plan-features">
							{ domainFeature }
							{ planFeatures.map( ( feature ) => {
								return (
									<li key={ feature }>
										<Gridicon
											className="remove-plan-dialog__item-cross-small"
											size={ 24 }
											icon="cross-small"
										/>
										{ feature }
									</li>
								);
							} ) }
						</ul>
					</Fragment>
				);
			}
		}

		return null;
	};

	/**
	 * Dialog classname
	 */
	const dialogClassName = shouldUseSiteThumbnail
		? 'remove-plan-dialog --with-screenshot'
		: 'remove-plan-dialog';

	/**
	 * Plan cancellation dialog.
	 */
	return (
		<Dialog
			buttons={ buttons }
			className={ dialogClassName }
			isVisible={ isDialogVisible }
			onClose={ closeDialog }
		>
			<Fragment>
				<button className="remove-plan-dialog__close-button" onClick={ closeDialog }>
					<Gridicon
						className="remove-plan-dialog__item-cross-small"
						size={ 24 }
						icon="cross-small"
					/>
				</button>
				<div className="remove-plan-dialog__grid">
					{ shouldUseSiteThumbnail && (
						<div className="remove-plan-dialog__grid-colmn">
							<SiteScreenshot
								className="remove-plan-dialog__site-screenshot"
								site={ site }
								alt={ siteName }
							/>
						</div>
					) }
					<div className="remove-plan-dialog__grid-colmn">
						<FormattedHeader
							brandFont
							headerText={ translate( 'Are you sure you want to cancel your %(label)s plan?', {
								args: { label: planLabel },
							} ) }
							align="left"
						/>
						<FeaturesList />
					</div>
				</div>
			</Fragment>
		</Dialog>
	);
};
