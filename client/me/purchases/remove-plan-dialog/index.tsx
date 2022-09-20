import { Dialog, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { Fragment } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import { SiteScreenshot } from '../site-screenshot/';
import getPlanFeatures from './get-plan-features';

import './style.scss';

interface RemovePlanDialogProps {
	closeDialog: () => void;
	removePlan: () => void;
	isDialogVisible: boolean;
	isRemoving: boolean;
	site: SiteExcerptData;
}

export const RemovePlanDialog = ( {
	closeDialog,
	removePlan,
	isDialogVisible,
	site,
}: RemovePlanDialogProps ) => {
	const translate = useTranslate();
	const siteName = site.name ?? '';

	/**
	 * Dialog buttons
	 */
	const buttons = [
		{
			action: 'removePlan',
			label: translate( 'Cancel my plan', {
				comment:
					'This button removes the active plan and all active Marketplace subscriptions on the site',
			} ),
			onClick: removePlan,
		},
		{
			action: 'cancel',
			label: translate( 'Keep my plan' ),
			onClick: closeDialog,
			isPrimary: true,
		},
	];

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

	/**
	 * Return the list of features that the user will lose by canceling their plan.
	 *
	 * @returns Fragment
	 */
	const FeaturesList = () => {
		if ( typeof productSlug === 'string' ) {
			const planFeatures = getPlanFeatures( productSlug );

			if ( planFeatures.length > 0 ) {
				return (
					<Fragment>
						<p>{ translate( 'If you cancel your plan, you will lose:' ) }</p>
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
