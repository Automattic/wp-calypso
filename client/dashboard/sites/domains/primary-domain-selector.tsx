import { type DomainSummary, type Site, type User, DomainSubtype } from '@automattic/api-core';
import { siteSetPrimaryDomainMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	Button,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState, useMemo } from 'react';
import InlineSupportLink from '../../components/inline-support-link';
import { Notice } from '../../components/notice';
import { userHasFlag } from '../../utils/user';
import type { Field } from '@wordpress/dataviews';

interface PrimaryDomainSelectorProps {
	domains: DomainSummary[];
	site: Site;
	user: User;
}

const PrimaryDomainSelector = ( { domains, site, user }: PrimaryDomainSelectorProps ) => {
	const [ formData, setFormData ] = useState< { primaryDomain: string } >( {
		primaryDomain: '',
	} );
	const [ showForm, setShowForm ] = useState( false );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const primaryWithPlanOnly = userHasFlag( user, 'calypso_allow_nonprimary_domains_without_plan' );
	const isOnFreePlan = site?.plan?.is_free ?? false;
	const canUserSetPrimaryDomainOnThisSite =
		! ( primaryWithPlanOnly && isOnFreePlan ) &&
		( site?.plan?.features?.active.includes( 'set-primary-custom-domain' ) ?? false );
	const setPrimaryDomainMutation = useMutation( siteSetPrimaryDomainMutation() );
	const currentPrimaryDomain = domains.find( ( domain ) => domain.primary_domain )?.domain;
	const domainsList = useMemo( () => {
		if ( ! domains || ! site ) {
			return [];
		}
		return domains.filter( ( domain ) => {
			// Basic eligibility criteria
			const isEligible =
				( domain.subtype.id === DomainSubtype.DOMAIN_REGISTRATION ||
					domain.subtype.id === DomainSubtype.DOMAIN_CONNECTION ||
					domain.subtype.id === DomainSubtype.DEFAULT_ADDRESS ) &&
				domain.can_set_as_primary &&
				! domain.primary_domain;

			if ( ! isEligible ) {
				return false;
			}

			return true;
		} );
	}, [ domains, site ] );

	if ( ! domains || ! site ) {
		return null;
	}

	const fields: Field< { primaryDomain: string } >[] = [
		{
			id: 'primaryDomain',
			label: __( 'Primary domain' ),
			elements: [
				{
					label: __( 'Select a domain name' ),
					value: '',
				},
				...domainsList.map( ( domain ) => {
					return {
						label: domain.domain,
						value: domain.domain,
					};
				} ),
			],
		},
	];

	const form = {
		layout: { type: 'regular' as const },
		fields: [ 'primaryDomain' ],
	};

	const renderMessage = () => {
		if ( ! canUserSetPrimaryDomainOnThisSite ) {
			return createInterpolateElement(
				'Your site plan doesn’t allow you to set a custom domain as a primary site address.<br/><upgradeLink>Upgrade to an annual paid plan</upgradeLink> and get a free one-year domain name registration or transfer. <learnMoreLink>Learn more</learnMoreLink>.',
				{
					upgradeLink: <a href={ `/plans/${ site.slug }` } />,
					br: <br />,
					learnMoreLink: <InlineSupportLink supportContext="primary-site-address" />,
				}
			);
		}
		if ( domainsList.length === 0 ) {
			return createInterpolateElement(
				'Before changing your primary site address you must register or connect a new custom domain. <learnMoreLink>Learn more</learnMoreLink>.',
				{
					learnMoreLink: <InlineSupportLink supportContext="primary-site-address" />,
				}
			);
		}

		return createInterpolateElement(
			'The current primary site address for this site is: <currentPrimaryDomain />. This is the site address your visitors will see while browsing your site. <learnMoreLink>Learn more</learnMoreLink>.',
			{
				currentPrimaryDomain: <strong>{ currentPrimaryDomain }</strong>,
				learnMoreLink: <InlineSupportLink supportContext="primary-site-address" />,
			}
		);
	};

	const handleSubmit = () => {
		if ( ! formData.primaryDomain ) {
			return;
		}
		setPrimaryDomainMutation.mutate(
			{ siteId: site.ID, domain: formData.primaryDomain },
			{
				onSuccess: () => {
					createSuccessNotice(
						sprintf(
							/* translators: %s is domain */
							__( 'Primary site address changed: all domains will redirect to %s.' ),
							formData.primaryDomain
						),
						{
							type: 'snackbar',
						}
					);
					setShowForm( false );
					setFormData( { primaryDomain: '' } );
				},
				onError: () => {
					createErrorNotice(
						__( 'Something went wrong and we couldn’t change your primary site address.' ),
						{
							type: 'snackbar',
						}
					);
				},
			}
		);
	};

	return (
		<Notice variant="info" title={ __( 'Primary site address' ) }>
			<VStack spacing={ 4 }>
				<Text as="p">{ renderMessage() }</Text>
				{ canUserSetPrimaryDomainOnThisSite && domainsList.length > 0 && ! showForm && (
					<HStack justify="flex-start">
						<Button variant="link" onClick={ () => setShowForm( true ) }>
							{ __( 'Change primary site address' ) }
						</Button>
					</HStack>
				) }
				{ showForm && (
					<HStack justify="flex-start" alignment="flex-end">
						<form>
							<DataForm< { primaryDomain: string } >
								data={ formData }
								fields={ fields }
								form={ form }
								onChange={ ( edits: { primaryDomain?: string } ) => {
									setFormData( ( data ) => ( { ...data, ...edits } ) );
								} }
							/>
						</form>
						<Button
							variant="primary"
							onClick={ handleSubmit }
							__next40pxDefaultSize
							disabled={ formData.primaryDomain === '' || setPrimaryDomainMutation.isPending }
						>
							{ __( 'Save' ) }
						</Button>
					</HStack>
				) }
			</VStack>
		</Notice>
	);
};

export default PrimaryDomainSelector;
