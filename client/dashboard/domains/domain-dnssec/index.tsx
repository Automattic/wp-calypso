import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import {
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	ToggleControl,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { domainQuery } from '../../app/queries/domain';
import { domainDnssecMutation } from '../../app/queries/domain-dnssec';
import { domainRoute } from '../../app/router/domains';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { DNSSECRecordTextarea } from './dnssec-record-textarea';

export default function DomainDNSSEC() {
	const { domainName } = domainRoute.useParams();
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const mutation = useMutation( domainDnssecMutation( domainName ) );

	const { isPending } = mutation;

	const handleToggleChange = ( enabled: boolean ) => {
		mutation.mutate( enabled, {
			onSuccess: () => {
				createSuccessNotice( __( 'DNSSEC setting saved.' ), { type: 'snackbar' } );
			},
			onError: () => {
				createErrorNotice( __( 'Failed to save DNSSEC settings.' ), {
					type: 'snackbar',
				} );
			},
		} );
	};

	return (
		<PageLayout size="small" header={ <PageHeader title="DNSSEC" /> }>
			<Card>
				<CardBody>
					{ ! domain.is_dnssec_supported ? (
						<Text>{ __( 'DNSSEC is not supported for this domain.' ) }</Text>
					) : (
						<VStack spacing={ 4 }>
							<HStack
								spacing={ 3 }
								alignment="left"
								style={ {
									flexWrap: 'wrap',
									gap: '8px',
								} }
							>
								<ToggleControl
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
										<DNSSECRecordTextarea
											key={ `dnskey-${ index }` }
											value={ dnskey }
											label="DNSKEY Record"
											recordType="dnskey"
											index={ index }
										/>
									) ) }
									{ domain.dnssec_records?.ds_data?.map( ( dsRecord, index ) => (
										<DNSSECRecordTextarea
											key={ `ds-${ index }` }
											value={ dsRecord }
											label="Delegation Signer (DS) record"
											recordType="ds"
											index={ index }
										/>
									) ) }
								</VStack>
							) }
						</VStack>
					) }
				</CardBody>
			</Card>
		</PageLayout>
	);
}
