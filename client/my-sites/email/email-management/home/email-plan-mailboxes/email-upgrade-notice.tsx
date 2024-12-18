import { Button, Notice } from '@wordpress/components';
import { Icon, starFilled } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';

export default function EmailUpgradeNotice() {
	const translate = useTranslate();

	return (
		<Notice
			className="email-plan-mailboxes-list__email-upgrade-notice"
			status="info"
			isDismissible={ false }
		>
			<div className="icon">
				<Icon icon={ starFilled } />
			</div>
			<div className="content">
				<strong>{ translate( 'Unlock the full power of your inbox' ) }</strong>
				<p>
					{ translate(
						'Upgrade to our professional email suite and enjoy advanced features, seamless organization, and enhanced productivity. Try it risk-free with a 14-day money back guarantee.'
					) }
				</p>
			</div>
			<Button variant="primary" size="compact">
				{ translate( 'Compare options' ) }
			</Button>
		</Notice>
	);
}
