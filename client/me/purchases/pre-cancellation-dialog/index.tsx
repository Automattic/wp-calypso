import { Dialog, Gridicon } from '@automattic/components';
import cx from 'classnames';
import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	hasAmountAvailableToRefund,
	isRefundable,
	maybeWithinRefundPeriod,
} from 'calypso/lib/purchases';
import { CALYPSO_CONTACT } from 'calypso/lib/url/support';
import { SiteScreenshot } from '../site-screenshot';
import getPlanCancellationFeatures from './get-plan-cancellation-features';
import type { Purchase } from 'calypso/lib/purchases/types';
import './style.scss';

interface PreCancellationDialogProps {
	closeDialog: () => void;
	removePlan: () => void;
	isDialogVisible: boolean;
	isRemoving: boolean;
	site: SiteExcerptData;
	purchase: Purchase;
	hasDomain: boolean;
	primaryDomain: string;
	wpcomURL: string;
}

/**
 * Pre Cancellation Dialog list of features.
 * Returns the list of features that the user will lose by canceling their plan.
 */
interface FeaturesListProps {
	productSlug: string | undefined;
	domainFeature: JSX.Element | null;
	isPurchaseRefundable: boolean;
	isPurchaseAutoRenewing: boolean;
}
export const FeaturesList = ( {
	productSlug,
	domainFeature,
	isPurchaseRefundable,
	isPurchaseAutoRenewing,
}: FeaturesListProps ) => {
	if ( typeof productSlug !== 'string' ) {
		return null;
	}

	const planFeatures = getPlanCancellationFeatures( productSlug );

	return (
		<>
			<ul
				className={
					'pre-cancellation-dialog__list-plan-features' +
					( domainFeature ? ' --with-domain-feature' : '' )
				}
			>
				{ domainFeature && (
					<li key="redirect-domain">
						<Gridicon
							className="pre-cancellation-dialog__item-cross-small"
							size={ 24 }
							icon="cross-small"
						/>
						{ domainFeature }
					</li>
				) }
				<li key="debug-refundable">
					<Gridicon
						className="pre-cancellation-dialog__item-cross-small"
						size={ 24 }
						icon="cross-small"
					/>
					{ isPurchaseRefundable ? 'Refundable: yes' : 'Refundable: no' }
				</li>
				<li key="debug-autorenew">
					<Gridicon
						className="pre-cancellation-dialog__item-cross-small"
						size={ 24 }
						icon="cross-small"
					/>
					{ isPurchaseAutoRenewing ? 'Auto-renew: yes' : 'Auto-renew: no' }
				</li>
				{ planFeatures.map( ( feature ) => {
					return (
						<li key={ feature }>
							<Gridicon
								className="pre-cancellation-dialog__item-cross-small"
								size={ 24 }
								icon="cross-small"
							/>
							{ feature }
						</li>
					);
				} ) }
			</ul>
		</>
	);
};

/**
 * Pre Cancellation Dialog bottom text:
 * - Link to contact support.
 * - If refundable, the amount to be refunded.
 */
interface RenderFooterTextProps {
	purchase: Purchase;
}

export const RenderFooterText = ( { purchase }: RenderFooterTextProps ) => {
	const translate = useTranslate();

	return (
		<div className="pre-cancellation-dialog--support">
			{ ! isRefundable( purchase ) && maybeWithinRefundPeriod( purchase )
				? translate(
						'Have a question? Want to request a refund? {{contactLink}}Ask a Happiness Engineer!{{/contactLink}}',
						{
							components: {
								contactLink: <a href={ CALYPSO_CONTACT } />,
							},
						}
				  )
				: translate( 'Have a question? {{contactLink}}Ask a Happiness Engineer!{{/contactLink}}', {
						components: {
							contactLink: <a href={ CALYPSO_CONTACT } />,
						},
				  } ) }
		</div>
	);
};

/**
 * The Pre Cancellation Dialog component
 */
export const PreCancellationDialog = ( {
	closeDialog,
	removePlan,
	isDialogVisible,
	site,
	purchase,
	hasDomain,
	primaryDomain,
	wpcomURL,
}: PreCancellationDialogProps ) => {
	const translate = useTranslate();
	/**
	 * Instantiate site's variables.
	 */
	const siteName = site.name ?? '';
	const productSlug = site.plan?.product_slug;
	const planLabel = site.plan?.product_name_short;
	const isComingSoon = site.is_coming_soon;
	const isPrivate = site.is_private;
	const launchedStatus = site.launch_status === 'launched' ? true : false;
	const shouldUseSiteThumbnail =
		isComingSoon === false && isPrivate === false && launchedStatus === true;

	/**
	 * Instantiate purchase variables.
	 */
	const isPurchaseRefundable = isRefundable( purchase );
	const isPurchaseAutoRenewing = purchase.isAutoRenewEnabled;

	/**
	 * Determine dialog subtitle.
	 */
	const { refundText } = purchase;
	const subTitle =
		isPurchaseRefundable && hasAmountAvailableToRefund( purchase ) ? (
			<div className="pre-cancellation-dialog--refund">
				{ hasAmountAvailableToRefund( purchase ) &&
					translate( '%(refundText)s to be refunded', {
						args: { refundText },
						context: 'refundText is of the form "[currency-symbol][amount]" i.e. "$20"',
					} ) }
			</div>
		) : (
			<>Subtitle</>
		);

	/**
	 * Click events, buttons tracking and action.
	 */
	const clickCancelPlan = () => {
		recordTracksEvent( 'calypso_pre_cancellation_modal_cancel_plan', {
			product_slug: productSlug,
			has_domain: hasDomain ? true : false,
			has_autorenew: isPurchaseAutoRenewing,
			is_refundable: isPurchaseRefundable,
		} );

		removePlan();
	};

	const clickCloseDialog = () => {
		recordTracksEvent( 'calypso_pre_cancellation_modal_keep_plan', {
			product_slug: productSlug,
			has_domain: hasDomain ? true : false,
			has_autorenew: isPurchaseAutoRenewing,
			is_refundable: isPurchaseRefundable,
		} );
		closeDialog();
	};

	/**
	 * Domain redirect copy
	 */
	const domainFeature =
		hasDomain && primaryDomain && wpcomURL ? (
			<p>Warning: domain traffic will be redirected</p>
		) : null;

	/**
	 * Dialog buttons
	 */
	const buttons = [
		{
			action: 'close',
			label: translate( 'Keep my plan' ),
			onClick: clickCloseDialog,
		},
		{
			action: 'cancel',
			label: translate( 'Cancel my plan' ),
			onClick: clickCancelPlan,
			isPrimary: true,
		},
	];

	/**
	 * Plan cancellation dialog.
	 */
	return (
		<Dialog
			buttons={ buttons }
			className={ cx( {
				'pre-cancellation-dialog': true,
				'--with-domain-feature': domainFeature !== null,
				'--with-screenshot': shouldUseSiteThumbnail,
			} ) }
			isVisible={ isDialogVisible }
			onClose={ closeDialog }
		>
			<>
				<button className="pre-cancellation-dialog__close-button" onClick={ closeDialog }>
					<Gridicon
						className="pre-cancellation-dialog__item-cross-small"
						size={ 24 }
						icon="cross-small"
					/>
				</button>
				<div className="pre-cancellation-dialog__grid">
					<div className="pre-cancellation-dialog__grid-colmn">
						<FormattedHeader
							brandFont
							headerText={ translate( 'Are you sure you want to cancel your %(label)s plan?', {
								args: { label: planLabel },
							} ) }
							align="left"
						/>
						<h2>{ subTitle }</h2>
						<FeaturesList
							productSlug={ productSlug }
							domainFeature={ domainFeature }
							isPurchaseRefundable={ isPurchaseRefundable }
							isPurchaseAutoRenewing={ isPurchaseAutoRenewing }
						/>
					</div>
					{ shouldUseSiteThumbnail && (
						<div className="pre-cancellation-dialog__grid-colmn">
							<SiteScreenshot
								className="pre-cancellation-dialog__site-screenshot"
								site={ site }
								alt={ 'The screenshot of the site: ' + siteName }
							/>
						</div>
					) }
				</div>
				<RenderFooterText purchase={ purchase } />
			</>
		</Dialog>
	);
};
