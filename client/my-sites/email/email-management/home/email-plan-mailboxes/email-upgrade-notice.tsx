import { Button, Notice } from '@wordpress/components';
import { Icon, starFilled } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';

type Props = {
	path?: string;
};
export default function EmailUpgradeNotice( { path }: Props ) {
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
			{ path && (
				<Button variant="primary" size="compact" href={ path }>
					{ translate( 'Compare options' ) }
				</Button>
			) }
		</Notice>
	);
}
