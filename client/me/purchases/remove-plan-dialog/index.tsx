import { Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { Fragment } from 'react';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';
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
			label: translate( 'Cancel' ),
			onClick: closeDialog,
		},
		{
			isPrimary: true,
			action: 'removePlanAndAllSubscriptions',
			label: translate( 'Remove Plan & All Subscriptions', {
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
				<FormSectionHeading>
					{ translate( 'New cancel flow - Remove plan: %(plan)s', {
						args: { plan: planName },
					} ) }
				</FormSectionHeading>

				{ shouldUseSiteThumbnail && (
					<SiteScreenshot
						className="remove-plan-dialog__site-screenshot"
						site={ site }
						size={ 'medium' }
					/>
				) }

				<p>
					{ translate( 'Dialog content' ) }
					<br />
				</p>
			</Fragment>
		</Dialog>
	);
};
