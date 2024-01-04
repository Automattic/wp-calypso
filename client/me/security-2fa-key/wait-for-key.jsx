import { Spinner } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

export default function WaitForKey() {
	const translate = useTranslate();

	return (
		<div className="security-2fa-key__add-wait-for-key">
			<Spinner />
			<p className="security-2fa-key__add-wait-for-key-heading">
				{ translate( 'Waiting for security key' ) }
			</p>
			<p>
				{ translate(
					'Connect and touch your security key to register it, or follow the directions in your browser or pop-up.'
				) }
			</p>
		</div>
	);
}
