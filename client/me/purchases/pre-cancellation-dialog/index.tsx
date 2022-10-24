import { Dialog, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import getPlanCancellationFeatures from './get-plan-cancellation-features';
import './style.scss';

interface PreCancellationDialogProps {
	closeDialog: () => void;
	removePlan: () => void;
	isDialogVisible: boolean;
	isRemoving: boolean;
	site: SiteExcerptData;
	hasDomain: boolean;
	isRefundable: boolean;
	isAutoRenewing: boolean;
	primaryDomain: string;
	wpcomURL: string;
}

export const PreCancellationDialog = ( {
	closeDialog,
	removePlan,
	isDialogVisible,
	site,
	hasDomain,
	isRefundable,
	isAutoRenewing,
	primaryDomain,
	wpcomURL,
}: PreCancellationDialogProps ) => {
	const translate = useTranslate();

	/**
	 * Instantiate site's plan variables.
	 */
	const productSlug = site.plan?.product_slug;
	const planLabel = site.plan?.product_name_short;
	const subTitle = translate( 'Subtitle' );

	/**
	 * Click events, buttons tracking and action.
	 */
	const clickCancelPlan = () => {
		removePlan();
	};

	const clickCloseDialog = () => {
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
			action: 'cancel',
			label: translate( 'Cancel my plan' ),
			onClick: clickCancelPlan,
		},
		{
			action: 'close',
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
			const planFeatures = getPlanCancellationFeatures( productSlug );

			return (
				<>
					<p>{ subTitle }</p>
					<ul
						className={
							'remove-plan-dialog__list-plan-features' +
							( domainFeature ? ' --with-domain-feature' : '' )
						}
					>
						{ domainFeature && (
							<li key="redirect-domain">
								<Gridicon
									className="remove-plan-dialog__item-cross-small"
									size={ 24 }
									icon="cross-small"
								/>
								{ domainFeature }
							</li>
						) }
						<li key="debug-refundable">
							<Gridicon
								className="remove-plan-dialog__item-cross-small"
								size={ 24 }
								icon="cross-small"
							/>
							{ isRefundable ? 'Refundable: yes' : 'Refundable: no' }
						</li>
						<li key="debug-autorenew">
							<Gridicon
								className="remove-plan-dialog__item-cross-small"
								size={ 24 }
								icon="cross-small"
							/>
							{ isAutoRenewing ? 'Auto-renew: yes' : 'Auto-renew: no' }
						</li>
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
				</>
			);
		}

		return null;
	};

	/**
	 * Dialog classname
	 */
	const classDomainFeature = domainFeature ? ' --with-domain-feature' : '';
	const dialogClassName = 'remove-plan-dialog' + classDomainFeature;

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
			<>
				<button className="remove-plan-dialog__close-button" onClick={ closeDialog }>
					<Gridicon
						className="remove-plan-dialog__item-cross-small"
						size={ 24 }
						icon="cross-small"
					/>
				</button>
				<div className="remove-plan-dialog__grid">
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
			</>
		</Dialog>
	);
};
