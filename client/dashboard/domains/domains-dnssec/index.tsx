import { useSuspenseQuery } from '@tanstack/react-query';
import {
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { DataForm, Field } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { domainsQuery } from '../../app/queries/domains';
import { siteDomainsQuery } from '../../app/queries/site-domains';
import { domainRoute } from '../../app/routes/domain-routes';
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
	type: 'regular' as const,
	fields: [ 'enabled' ],
};

export default function DomainPlaceholder() {
	const { data: allDomains } = useSuspenseQuery( domainsQuery() );

	// get the current domain from the current route
	const { domainName } = domainRoute.useParams();

	// get the domain details using the site domain
	const domain = allDomains.find( ( domain ) => domain.domain === domainName );

	if ( ! domain ) {
		throw new Error( 'Domain not found' );
	}

	const { data: siteDomains } = useSuspenseQuery( siteDomainsQuery( domain.blog_id ) );

	const siteDomain = siteDomains.find( ( siteDomain ) => siteDomain.domain === domainName );

	const [ formData, setFormData ] = useState< DNSSECFormData >( {
		enabled: siteDomain?.is_dnssec_enabled ?? false,
	} );

	const isDirty = true;
	const isPending = false;

	return (
		<PageLayout size="small" header={ <PageHeader title="DNSSEC" /> }>
			<Card>
				<CardBody>
					<form
						onSubmit={ ( e: React.FormEvent ) => {
							e.preventDefault();
						} }
					>
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
				</CardBody>
			</Card>
		</PageLayout>
	);
}
