import { domainDnssecMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { DnsSecRecordTextarea } from './dnssec-record-textarea';
import type { Domain } from '@automattic/api-core';

interface DnsSecProps {
	domainName: string;
	domain: Domain;
}

export default function DnsSec( { domainName, domain }: DnsSecProps ) {
	const mutation = useMutation( {
		...domainDnssecMutation( domainName ),
		meta: {
			snackbar: {
				success: __( 'DNSSEC setting saved.' ),
				error: __( 'Failed to save DNSSEC settings.' ),
			},
		},
	} );

	const { isPending } = mutation;

	const handleToggleChange = ( enabled: boolean ) => {
		mutation.mutate( enabled );
	};

	return (
		<Card>
			<CardBody>
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
								label={ domain.is_dnssec_enabled ? __( 'Disable DNSSEC' ) : __( 'Enable DNSSEC' ) }
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
			</CardBody>
		</Card>
	);
}
