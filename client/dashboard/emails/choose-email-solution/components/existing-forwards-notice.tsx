import { Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export const ExistingForwardsNotice = () => {
	return (
		<Notice status="warning" isDismissible={ false }>
			{ __(
				'Existing email forwards will be removed once you upgrade. Set up the email addresses you want to continue using below.'
			) }
		</Notice>
	);
};
