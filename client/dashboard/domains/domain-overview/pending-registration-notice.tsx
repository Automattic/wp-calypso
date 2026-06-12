import { Button, __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import Notice from '../../components/notice';
import type { Domain } from '@automattic/api-core';

export default function PendingRegistrationNotice( { domain }: { domain: Domain } ) {
	if ( domain.pending_registration_at_registry ) {
		return (
			<Notice
				variant="warning"
				title={ __( 'Domain registration in progress' ) }
				actions={
					domain.pending_registration_at_registry_url ? (
						<Button
							variant="link"
							href={ domain.pending_registration_at_registry_url }
							target="_blank"
							rel="noopener noreferrer"
						>
							{ __( 'More info' ) }
						</Button>
					) : undefined
				}
			>
				<Text>
					{ __(
						'We forwarded the domain registration request to Registro.br (.com.br registry). It may take up to 3 days for the request to be evaluated and accepted.'
					) }
				</Text>
			</Notice>
		);
	}

	if ( domain.pending_registration ) {
		return (
			<Notice variant="warning" title={ __( 'Domain registration in progress' ) }>
				<Text>
					{ __(
						'Your domain is being registered - this usually takes just a few minutes. Please check back shortly.'
					) }
				</Text>
			</Notice>
		);
	}

	return null;
}
