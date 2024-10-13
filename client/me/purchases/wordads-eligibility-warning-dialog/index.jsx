import { Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';

import './style.scss';

const WordAdsEligibilityWarningDialog = ( {
	closeDialog,
	isDialogVisible,
	planName,
	removePlan,
} ) => {
	const translate = useTranslate();

	const buttons = [
		{
			action: 'cancel',
			label: translate( 'Keep plan' ),
		},
		{
			action: 'remove',
			isPrimary: true,
			label: translate( 'Remove plan' ),
			onClick: removePlan,
		},
	];

	return (
		<Dialog
			buttons={ buttons }
			className="wordads-eligibility-warning-dialog"
			isVisible={ isDialogVisible }
			onClose={ closeDialog }
		>
			<>
				<FormSectionHeading>
					{ translate( 'Remove %(plan)s', {
						args: { plan: planName },
					} ) }
				</FormSectionHeading>
				<p>
					{ translate(
						'When you downgrade your plan, you will become ineligible for the WordAds program. Visit {{a}}our FAQ{{/a}} to learn more.',
						{
							components: {
								a: (
									<a
										href="https://wordads.co/faq/#eligibility-for-wordads"
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
								br: <br />,
							},
						}
					) }
					<br />
					<br />
					{ translate( 'Would you still like to downgrade your plan?' ) }
				</p>
			</>
		</Dialog>
	);
};

export default WordAdsEligibilityWarningDialog;
