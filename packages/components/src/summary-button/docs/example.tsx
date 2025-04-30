import { Icon } from '@wordpress/components';
import { backup } from '@wordpress/icons';
import SummaryButton from '../index';

function SummaryButtonExample() {
	return (
		<SummaryButton
			title="Domain Settings"
			description="Manage your domain settings, DNS, email, and more."
			decoration={ <Icon icon={ backup } /> }
			badges={ [
				{ text: 'Needs attention', intent: 'warning' },
				{ text: 'Auto-renew off', intent: 'error' },
			] }
		/>
	);
}

SummaryButtonExample.displayName = 'SummaryButton';
export default SummaryButtonExample;
