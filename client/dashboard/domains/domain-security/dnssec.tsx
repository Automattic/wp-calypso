import { domainDnssecMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	ToggleControl,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { Card, CardBody } from '../../components/card';
import InlineSupportLink from '../../components/inline-support-link';
import { SectionHeader } from '../../components/section-header';
import { DnsSecRecordTextarea } from './dnssec-record-textarea';
import type { Domain } from '@automattic/api-core';

interface DnsSecProps {
	domainName: string;
	domain: Domain;
}

export default function DnsSec( { domainName, domain }: DnsSecProps ) {
	const { recordTracksEvent } = useAnalytics();
	const mutation = useMutation( {
		...domainDnssecMutation( domainName ),
		meta: {
			snackbar: {
				/* translators: %s is the domain name */
				success: sprintf( __( 'DNSSEC setting for %s saved.' ), domainName ),
				error: { source: 'server' },
			},
		},
	} );

	const { isPending } = mutation;

	const handleToggleChange = ( enabled: boolean ) => {
		// Track the toggle action

		recordTracksEvent( 'calypso_dashboard_domain_dnssec_toggle', {
			domain: domainName,
			dnssec_enabled: enabled,
		} );

		mutation.mutate( enabled, {
			onSuccess: () => {
				// Track success
				recordTracksEvent( 'calypso_dashboard_domain_dnssec_toggle_success', {
					domain: domainName,
					dnssec_enabled: enabled,
				} );
			},
			onError: ( error: Error ) => {
				// Track failure
				recordTracksEvent( 'calypso_dashboard_domain_dnssec_toggle_failure', {
					domain: domainName,
					dnssec_enabled: enabled,
					error_message: error.message,
				} );
			},
		} );
	};

	return (
		<Card>
			<CardBody>
				<SectionHeader
					title={ __( 'DNSSEC' ) }
					description={ createInterpolateElement(
						__(
							'A security feature that helps protect your domain from DNS hijacking. <learnMoreLink />'
						),
						{ learnMoreLink: <InlineSupportLink supportContext="domain-dnssec" /> }
					) }
					level={ 3 }
				/>
				<p>
					{ ! domain.is_dnssec_supported ? (
						<Text>{ __( 'DNSSEC is not supported for this domain.' ) }</Text>
					) : (
						<VStack spacing={ 4 }>
							<HStack alignment="left">
								<ToggleControl
									__nextHasNoMarginBottom
									checked={ domain.is_dnssec_enabled ?? false }
									onChange={ ( checked ) => handleToggleChange( checked ) }
									disabled={ isPending }
									label={
										domain.is_dnssec_enabled ? __( 'Disable DNSSEC' ) : __( 'Enable DNSSEC' )
									}
								/>
							</HStack>
							{ domain.is_dnssec_enabled && (
								<VStack spacing={ 3 }>
									{ domain.dnssec_records?.dnskey?.map( ( dnskey, index ) => (
										<DnsSecRecordTextarea
											key={ `dnskey-${ index }` }
											value={ dnskey }
											label="DNSKEY Record"
										/>
									) ) }
									{ domain.dnssec_records?.ds_data?.map( ( dsRecord, index ) => (
										<DnsSecRecordTextarea
											key={ `ds-${ index }` }
											value={ dsRecord }
											label="Delegation Signer (DS) record"
										/>
									) ) }
								</VStack>
							) }
						</VStack>
					) }
				</p>
			</CardBody>
		</Card>
	);
}
