import { setWwwPrimaryDomainMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import { ButtonStack } from '../../components/button-stack';
import type { DomainSummary } from '@automattic/api-core';

interface WwwPrimaryDomainModalProps {
	domain: DomainSummary;
	onClose: () => void;
}

export function WwwPrimaryDomainModal( { domain, onClose }: WwwPrimaryDomainModalProps ) {
	const { recordTracksEvent } = useAnalytics();
	const wwwDomain = `www.${ domain.domain }`;

	const { mutate, isPending } = useMutation(
		withSnackbar( setWwwPrimaryDomainMutation(), {
			/* translators: %s is the domain name, e.g. www.example.com */
			success: sprintf( __( '%s is now the primary site address.' ), wwwDomain ),
			error: { source: 'server' },
		} )
	);

	const onConfirm = () => {
		recordTracksEvent( 'calypso_dashboard_domains_www_primary_confirm', {
			domain: domain.domain,
			enabled: true,
		} );

		mutate(
			{ siteId: domain.blog_id, domain: domain.domain, enabled: true },
			{ onSuccess: onClose }
		);
	};

	return (
		<VStack spacing={ 6 }>
			<VStack spacing={ 4 }>
				<Text>
					{ createInterpolateElement(
						/* translators: <wwwDomain /> is the www domain name, <domain /> is the root domain name */
						__(
							'Visitors who go to <wwwDomain /> are already redirected to <domain />, so your site works with and without “www” today.'
						),
						{
							wwwDomain: <strong>{ wwwDomain }</strong>,
							domain: <strong>{ domain.domain }</strong>,
						}
					) }
				</Text>
				<Text>
					{ __(
						'Most browsers hide “www” in the address bar, so most visitors won’t notice this change. It only changes which address your site redirects to. Only continue if you have a specific reason to use the “www” address.'
					) }
				</Text>
			</VStack>
			<ButtonStack justify="flex-end">
				<Button __next40pxDefaultSize variant="tertiary" onClick={ onClose } disabled={ isPending }>
					{ __( 'Cancel' ) }
				</Button>
				<Button
					__next40pxDefaultSize
					variant="primary"
					onClick={ onConfirm }
					isBusy={ isPending }
					disabled={ isPending }
				>
					{ sprintf(
						/* translators: %s is the domain name, e.g. www.example.com */
						__( 'Use %s' ),
						wwwDomain
					) }
				</Button>
			</ButtonStack>
		</VStack>
	);
}
