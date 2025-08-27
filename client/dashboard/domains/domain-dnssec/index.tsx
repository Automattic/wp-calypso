import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import {
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm, Field } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { domainQuery } from '../../app/queries/domain';
import { domainDnssecMutation } from '../../app/queries/domain-dnssec';
import { domainRoute } from '../../app/router/domains';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

type DNSSECFormData = {
	enabled: boolean;
};

const fields: Field< DNSSECFormData >[] = [
	{
		id: 'enabled',
		label: __( 'Enable DNSSEC' ),
		Edit: 'checkbox',
	},
];

const form = {
	layout: { type: 'regular' as const },
	fields: [ 'enabled' ],
};

export default function DomainDNSSEC() {
	const { domainName } = domainRoute.useParams();
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const mutation = useMutation( domainDnssecMutation( domainName, domain.blog_id ) );

	const [ formData, setFormData ] = useState< DNSSECFormData >( {
		enabled: domain.is_dnssec_enabled ?? false,
	} );

	const isDirty = formData.enabled !== domain.is_dnssec_enabled;
	const { isPending } = mutation;

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		mutation.mutate( formData.enabled, {
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
						<form onSubmit={ handleSubmit }>
							<VStack spacing={ 4 }>
								<DataForm< DNSSECFormData >
									data={ formData }
									fields={ fields }
									form={ form }
									onChange={ ( edits: Partial< DNSSECFormData > ) => {
										setFormData( ( data ) => ( { ...data, ...edits } ) );
									} }
								/>
								<HStack justify="flex-start">
									<Button
										variant="primary"
										type="submit"
										isBusy={ isPending }
										disabled={ isPending || ! isDirty }
									>
										{ __( 'Save' ) }
									</Button>
								</HStack>
							</VStack>
						</form>
					) }
				</CardBody>
			</Card>
		</PageLayout>
	);
}
