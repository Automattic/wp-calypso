import { __ } from '@wordpress/i18n';

export default function AgencyClientSubscriptions() {
	return (
		<div>
			<h1>{ __( 'Agency client subscriptions', 'full-site-editing' ) }</h1>
			<p>
				{ __(
					'Minimal placeholder for the A4A agency client subscriptions overview.',
					'full-site-editing'
				) }
			</p>
		</div>
	);
}
