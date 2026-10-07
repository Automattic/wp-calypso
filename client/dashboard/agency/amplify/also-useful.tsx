import { __ } from '@wordpress/i18n';
import { Icon, home } from '@wordpress/icons';

export default function AmplifyAlsoUseful() {
	return (
		<aside className="dashboard-amplify-also">
			<span className="dashboard-amplify-also__icon" aria-hidden="true">
				<Icon icon={ home } size={ 20 } />
			</span>
			<p>
				{ __(
					'These reports are also useful for improving your own agency homepage, or your current client sites.'
				) }
			</p>
		</aside>
	);
}
