import { type DomainContactDetails, type WhoisDataEntry, WhoisType } from '@automattic/api-core';
import { bulkDomainsActionMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { arrowLeft } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo } from 'react';
import { domainsContactInfoRoute, domainsRoute } from '../../app/router/domains';
import ContactForm from '../../components/domain-contact-details-form/contact-form';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import { Text } from '../../components/text';
import { mostCommonValueInArray } from '../../utils/collection';
import { omit } from '../../utils/object';

const aggregateWhoisDataWithMostCommonValues = (
	whoisData: WhoisDataEntry[]
): DomainContactDetails => {
	const result: DomainContactDetails = {
		optOutTransferLock: false,
		firstName: mostCommonValueInArray( whoisData.map( ( whois ) => whois.fname ) ),
		lastName: mostCommonValueInArray( whoisData.map( ( whois ) => whois.lname ) ),
		organization: mostCommonValueInArray( whoisData.map( ( whois ) => whois.org ) ),
		email: mostCommonValueInArray( whoisData.map( ( whois ) => whois.email ) ),
		phone: mostCommonValueInArray( whoisData.map( ( whois ) => whois.phone ) ),
		address1: mostCommonValueInArray( whoisData.map( ( whois ) => whois.sa1 ) ),
		address2: mostCommonValueInArray( whoisData.map( ( whois ) => whois.sa2 ) ),
		city: mostCommonValueInArray( whoisData.map( ( whois ) => whois.city ) ),
		state: mostCommonValueInArray( whoisData.map( ( whois ) => whois.state ) ),
		countryCode: mostCommonValueInArray( whoisData.map( ( whois ) => whois.country_code ) ),
		postalCode: mostCommonValueInArray( whoisData.map( ( whois ) => whois.pc ) ),
		fax: mostCommonValueInArray( whoisData.map( ( whois ) => whois.fax ) ),
	};

	return result;
};

export default function DomainsContactInfo() {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const router = useRouter();

	const { selectedDomains } = domainsContactInfoRoute.useLoaderDeps() as {
		selectedDomains: string[];
	};

	const whoisData = domainsContactInfoRoute.useLoaderData() as WhoisDataEntry[][];

	const initialData = useMemo( () => {
		if ( ! whoisData?.length ) {
			return { optOutTransferLock: false };
		}

		return aggregateWhoisDataWithMostCommonValues(
			whoisData.flat().filter( ( whois ) => whois.type === WhoisType.REGISTRANT )
		);
	}, [ whoisData ] );

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
			<div>
				<span>
					{ sprintf(
						/* translators: %(domainCount) is the number of domains */
						__( 'Editing contact details for %(domainCount)d domains:' ),
						{ domainCount: selectedDomains.length }
					) }
				</span>
				<ul>
					{ selectedDomains.map( ( domain ) => (
						<li key={ domain }>{ domain }</li>
					) ) }
				</ul>
			</div>
			<ContactForm
				initialData={ initialData }
				isSubmitting={ isPending }
				onSubmit={ handleSubmit }
			/>
		</PageLayout>
	);
}
