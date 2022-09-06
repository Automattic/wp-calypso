import { Dialog, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { Fragment } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import { SiteScreenshot } from '../site-screenshot';
import getPlanFeatures from './get-plan-features';

import './style.scss';

interface RemovePlanDialogProps {
	planName: string;
	closeDialog: () => void;
	removePlan: () => void;
	isDialogVisible: boolean;
	isRemoving: boolean;
	site: SiteExcerptData;
}

export const RemovePlanDialog = ( {
	planName,
	closeDialog,
	removePlan,
	isDialogVisible,
	site,
}: RemovePlanDialogProps ) => {
	const translate = useTranslate();

	const buttons = [
		{
			action: 'cancel',
			label: translate( 'Keep my plan' ),
			onClick: closeDialog,
		},
		{
			isPrimary: true,
			action: 'removePlanAndAllSubscriptions',
			label: translate( 'Cancel my plan', {
				comment:
					'This button removes the active plan and all active Marketplace subscriptions on the site',
			} ),
			onClick: removePlan,
		},
	];

	/**
	 * Istantiate plan variables.
	 */
	const planLabel = planName.replace( 'WordPress.com ', '' );
	const isComingSoon = site.is_coming_soon;
	const isPrivate = site.is_private;
	const shouldUseSiteThumbnail = isComingSoon === false && isPrivate === false;

	/**
	 * Return the list of features that the user will lose by canceling their plan.
	 *
	 * @returns Fragment
	 */
	const FeaturesList = () => {
		const planFeatures = getPlanFeatures(
			/*planInCart,*/
			translate /*,
			hasDomainsInCart,
			hasRenewalInCart,
			nextDomainIsFree*/
		);

		return (
			<Fragment>
				<ul className="remove-plan-dialog__list-plan-features">
					{ planFeatures.map( ( feature, index ) => {
						return (
							<li key={ index }>
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
	};

	const gridClassName = shouldUseSiteThumbnail
		? 'remove-plan-dialog__grid --with-screenshot'
		: 'remove-plan-dialog__grid';

	return (
		<Dialog
			buttons={ buttons }
			className="remove-plan-dialog"
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
				<div className={ gridClassName }>
					{ shouldUseSiteThumbnail && (
						<div className="remove-plan-dialog__grid-colmn">
							<SiteScreenshot
								className="remove-plan-dialog__site-screenshot"
								site={ site }
								size={ 'medium' }
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
						<p>{ translate( 'If you cancel your plan, you will lose:' ) }</p>
						<FeaturesList />
					</div>
				</div>
			</Fragment>
		</Dialog>
	);
};
