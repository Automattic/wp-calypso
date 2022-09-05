import { Dialog, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { Fragment } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import { SiteScreenshot } from '../site-screenshot';

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

	const isComingSoon = site.is_coming_soon;
	const isPrivate = site.is_private;
	const shouldUseSiteThumbnail = isComingSoon === false && isPrivate === false;

	return (
		<Dialog
			buttons={ buttons }
			className="remove-plan-dialog"
			isVisible={ isDialogVisible }
			onClose={ closeDialog }
		>
			<Fragment>
				{ shouldUseSiteThumbnail && (
					<div className="remove-plan-dialog__grid">
						<div className="remove-plan-dialog__grid-colmn1">
							<SiteScreenshot
								className="remove-plan-dialog__site-screenshot"
								site={ site }
								size={ 'medium' }
							/>
						</div>
						<div className="remove-plan-dialog__grid-colmn2">
							<FormattedHeader
								brandFont
								headerText={ translate( 'Are you sure you want to cancel your Business plan?' ) }
								align="left"
							/>
							<p>{ translate( 'If you cancel your plan, you will lose:' ) }</p>
							<ul className="remove-plan-dialog__list-plan-features">
								<li>
									<Gridicon
										className="remove-plan-dialog__item-cross-small"
										size={ 24 }
										icon="cross-small"
									/>
									Your free domain for the first year
								</li>
								<li>
									<Gridicon
										className="remove-plan-dialog__item-cross-small"
										size={ 24 }
										icon="cross-small"
									/>
									Access to more than 50,000 plugins
								</li>
								<li>
									<Gridicon
										className="remove-plan-dialog__item-cross-small"
										size={ 24 }
										icon="cross-small"
									/>
									Advanced SEO tools
								</li>
								<li>
									<Gridicon
										className="remove-plan-dialog__item-cross-small"
										size={ 24 }
										icon="cross-small"
									/>
									Automated site backups and on-click restore
								</li>
								<li>
									<Gridicon
										className="remove-plan-dialog__item-cross-small"
										size={ 24 }
										icon="cross-small"
									/>
									SFTP and Database Acccess
								</li>
								<li>
									<Gridicon
										className="remove-plan-dialog__item-cross-small"
										size={ 24 }
										icon="cross-small"
									/>
									Access to live chat support
								</li>
								<li>
									<Gridicon
										className="remove-plan-dialog__item-cross-small"
										size={ 24 }
										icon="cross-small"
									/>
									and more
								</li>
							</ul>
						</div>
					</div>
				) }

				{ ! shouldUseSiteThumbnail && (
					<div className="remove-plan-dialog__grid">
						<div className="remove-plan-dialog__grid-row">
							<p>
								{ translate( 'Dialog content' ) }
								<br />
								<ul>
									<li>Item1 </li>
									<li>Item2 </li>
									<li>Item3 </li>
									<li>Item4 </li>
									<li>Item5 </li>
								</ul>
							</p>
						</div>
					</div>
				) }
			</Fragment>
		</Dialog>
	);
};
