import {
	type DomainContactDetails,
	type WhoisDataEntry,
	WhoisType,
	type Domain,
} from '@automattic/api-core';
import { bulkDomainsActionMutation, domainWhoisValidateMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { useDispatch } from '@wordpress/data';
import { __, sprintf, _n } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import { domainsContactInfoRoute, domainsIndexRoute } from '../../app/router/domains';
import ContactForm from '../../components/domain-contact-details-form/contact-form';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
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

const getFieldMapping = ( field: string ) => {
	const fieldMapping: Record< string, string > = {
		first_name: __( 'First name' ),
		last_name: __( 'Last name' ),
		organization: __( 'Organization' ),
		country_code: __( 'Country' ),
	};

	if ( fieldMapping[ field ] ) {
		return fieldMapping[ field ];
	}

	// Unrecognized field so we don't have a translation, but fallback to something readable in English at least.
	return field.replace( /_/, ' ' ).replace( /^(.)/, ( match ) => match.toUpperCase() );
};

export default function DomainsContactInfo() {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const router = useRouter();

	const { selectedDomains } = domainsContactInfoRoute.useLoaderDeps() as {
		selectedDomains: string[];
	};

	const { domainDetails, whoisData } = domainsContactInfoRoute.useLoaderData() as {
		domainDetails: Domain[];
		whoisData: WhoisDataEntry[][];
	};

	const { initialData, key } = useMemo( () => {
		if ( ! whoisData?.length ) {
			const initialData = { optOutTransferLock: false };

			return { initialData, key: JSON.stringify( initialData ) };
		}

		const initialData = aggregateWhoisDataWithMostCommonValues(
			whoisData.flat().filter( ( whois ) => whois.type === WhoisType.REGISTRANT )
		);

		return { initialData, key: JSON.stringify( initialData ) };
	}, [ whoisData ] );

	const domainsWithUnmodifiableContactInfo = useMemo( () => {
		return domainDetails
			.map( ( domain ) => ( {
				domain: domain.domain,
				whois_update_unmodifiable_fields: domain.whois_update_unmodifiable_fields,
			} ) )
			.filter( ( domain ) => domain.whois_update_unmodifiable_fields.length > 0 );
	}, [ domainDetails ] );

	const {
		mutate: validateBulkDomains,
		mutateAsync: validateBulkDomainsAsync,
		isPending: isValidatePending,
	} = useMutation( domainWhoisValidateMutation( selectedDomains ) );

	const { mutate: bulkDomainsAction, isPending: isUpdatePending } = useMutation(
		bulkDomainsActionMutation()
	);

	const handleSubmit = ( originalData: DomainContactDetails ) => {
		validateBulkDomains( originalData, {
			onSuccess: ( data ) => {
				if ( data.success ) {
					const { optOutTransferLock, ...whois } = originalData;

					bulkDomainsAction(
						{
							type: 'update-contact-info',
							domains: selectedDomains,
							transfer_lock: optOutTransferLock === false,
							whois: omit( whois, [ 'extra' ] as const ),
						},
						{
							onSuccess: () => {
								createSuccessNotice( __( 'Contact details saved.' ), { type: 'snackbar' } );
								router.navigate( { to: domainsIndexRoute.fullPath } );
							},
							onError: ( error: Error ) => {
								createErrorNotice( error.message, {
									type: 'snackbar',
								} );
							},
						}
					);
				} else {
					createErrorNotice( data.messages_simple.join( ' ' ), {
						type: 'snackbar',
					} );
				}
			},
			onError: ( error: Error ) => {
				createErrorNotice( error.message, {
					type: 'snackbar',
				} );
			},
		} );
	};

	const editingMessage =
		/* translators: %(domainCount) is the number of domains */
		_n(
			'Editing contact details for %(domainCount)d domain:',
			'Editing contact details for %(domainCount)d domains:',
			selectedDomains.length
		);

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'Domain contact details' ) }
				/>
			}
		>
			<div>
				<Text variant="muted">
					{ __( 'Note: Changes may take a few minutes to appear on the dashboard' ) }
				</Text>
			</div>
			<div>
				<span>{ sprintf( editingMessage, { domainCount: selectedDomains.length } ) }</span>
				<ul>
					{ selectedDomains.map( ( domain ) => (
						<li key={ domain }>{ domain }</li>
					) ) }
				</ul>
			</div>
			{ domainsWithUnmodifiableContactInfo.length > 0 && (
				<div>
					<span>
						<strong>{ __( 'The following domain fields will not be updated:' ) }</strong>
					</span>
					<ul>
						{ domainsWithUnmodifiableContactInfo.map( ( domain ) => (
							<li key={ domain.domain }>
								<strong>{ domain.domain }</strong>
								<ul style={ { listStylePosition: 'inside' } }>
									{ domain.whois_update_unmodifiable_fields.map( ( field: string ) => (
										<li key={ field }>{ getFieldMapping( field ) }</li>
									) ) }
								</ul>
							</li>
						) ) }
					</ul>
				</div>
			) }
			<ContactForm
				key={ key }
				initialData={ initialData }
				isSubmitting={ isValidatePending || isUpdatePending }
				onSubmit={ handleSubmit }
				validate={ validateBulkDomainsAsync }
			/>
		</PageLayout>
	);
}
