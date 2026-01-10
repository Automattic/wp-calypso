import { type Domain } from '@automattic/api-core';
import { __ } from '@wordpress/i18n';

interface PrivacyStatusProps {
	domain: Domain;
	privacyEnabled: boolean;
}

export default function PrivacyStatus( { domain, privacyEnabled }: PrivacyStatusProps ) {
	// This component will be implemented in later tasks
	return (
		<div>
			<p>{ __( 'Privacy status component will be implemented in later tasks' ) }</p>
			<p>
				{ __( 'Domain:' ) } { domain.domain }
			</p>
			<p>
				{ __( 'Privacy enabled:' ) } { privacyEnabled ? __( 'Yes' ) : __( 'No' ) }
			</p>
		</div>
	);
}
