import { bulkDomainsActionMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { arrowLeft } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { domainsContactInfoRoute, domainsRoute } from '../../app/router/domains';
import ContactForm from '../../components/domain-contact-details-form/contact-form';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import { Text } from '../../components/text';
import { omit } from '../../utils/object';
import type { DomainContactDetails } from '@automattic/api-core';

export default function DomainsContactInfo() {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const router = useRouter();

	const { selected } = domainsContactInfoRoute.useSearch();
	const selectedDomains: string[] =
		selected?.split( ',' ).map( ( domain: string ) => domain.trim() ) ?? [];

	const { mutate: bulkDomainsAction, isPending } = useMutation( bulkDomainsActionMutation() );

	const handleSubmit = ( { optOutTransferLock, ...whois }: DomainContactDetails ) => {
		bulkDomainsAction(
			{
				type: 'update-contact-info',
				domains: selectedDomains,
				transfer_lock: optOutTransferLock,
				// Should bulk domains allow extra fields?
				whois: omit( whois, [ 'extra' ] as const ),
			},
			{
				onSuccess: () => {
					createSuccessNotice( __( 'Contact details saved.' ), { type: 'snackbar' } );
					router.navigate( { to: domainsRoute.fullPath } );
				},
				onError: ( error: Error ) => {
					createErrorNotice( error.message, {
						type: 'snackbar',
					} );
				},
			}
		);
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={
						<RouterLinkButton icon={ arrowLeft } iconSize={ 12 } to={ domainsRoute.to }>
							<Text variant="muted">{ __( 'Domains' ) }</Text>
						</RouterLinkButton>
					}
					title={ __( 'Domain contact details' ) }
				/>
			}
		>
			<ContactForm
				beforeForm={
					<div>
						<p>
							{ sprintf(
								/* translators: %(domainCount) is the number of domains */
								__( 'Editing contact details for %(domainCount)d domains:' ),
								{ domainCount: selectedDomains.length }
							) }
						</p>
						<ul>
							{ selectedDomains.map( ( domain ) => (
								<li key={ domain }>{ domain }</li>
							) ) }
						</ul>
					</div>
				}
				isSubmitting={ isPending }
				onSubmit={ handleSubmit }
			/>
		</PageLayout>
	);
}
