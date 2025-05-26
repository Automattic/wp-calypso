import { useQuery, useMutation } from '@tanstack/react-query';
import { notFound } from '@tanstack/react-router';
import { Card, CardBody, ExternalLink } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { getQueryArg } from '@wordpress/url';
import React, { useState } from 'react';
import { useAuth } from '../../app/auth';
import { siteQuery, siteOwnerTransferMutation } from '../../app/queries';
import PageLayout from '../../components/page-layout';
import { useCanTransferSite } from '../hooks/use-can-transfer-site';
import SettingsPageHeader from '../settings-page-header';
import { ConfirmNewOwnerForm, ConfirmNewOwnerFormData } from './confirm-new-owner-form';
import { EmailConfirmation } from './email-confirmation';
import { InvitationEmailSent } from './invitation-email-sent';
import { StartSiteTransferForm } from './start-site-transfer-form';

const MIN_STEP = 0;

const MAX_STEP = 2;

const SettingsTransferSitePageLayout = ( { children }: { children: React.ReactNode } ) => {
	return (
		<PageLayout
			size="small"
			header={
				<SettingsPageHeader
					title={ __( 'Transfer site' ) }
					description={ createInterpolateElement(
						__(
							'Transfer this site to a new or existing site member with just a few clicks. <learnMoreLink />.'
						),
						{
							learnMoreLink: <ExternalLink href="#learn-more">{ __( 'Learn more' ) }</ExternalLink>,
						}
					) }
				/>
			}
		>
			{ children }
		</PageLayout>
	);
};

// TODO: Use Stepper component when the design is ready.
export default function SettingsTransferSite( { siteSlug }: { siteSlug: string } ) {
	const { createErrorNotice } = useDispatch( noticesStore );
	const { user } = useAuth();
	const { data: site } = useQuery( siteQuery( siteSlug ) );
	const canTransferSite = useCanTransferSite( { site } );
	const [ newOwnerEmail, setNewOwnerEmail ] = useState( '' );
	const [ currentStep, setCurrentStep ] = useState( 0 );
	const mutation = useMutation( siteOwnerTransferMutation( siteSlug ) );
	const confirmationHash = getQueryArg( window.location.search, 'site-transfer-confirm' );

	const handleBack = () => setCurrentStep( ( step ) => Math.max( step - 1, MIN_STEP ) );

	const handleForward = () => setCurrentStep( ( step ) => Math.min( step + 1, MAX_STEP ) );

	const handleConfirmNewOwner = ( data: ConfirmNewOwnerFormData ) => {
		setNewOwnerEmail( data.email );
		handleForward();
	};

	const handleStartSiteTransfer = () => {
		mutation.mutate(
			{ new_site_owner: newOwnerEmail },
			{
				onSuccess: () => {
					handleForward();
				},
				onError: ( error: Error ) => {
					createErrorNotice( error.message ?? __( 'Failed to transfer site.' ), {
						type: 'snackbar',
					} );
				},
			}
		);
	};

	if ( ! site ) {
		return null;
	}

	if ( ! canTransferSite ) {
		throw notFound();
	}

	if ( confirmationHash ) {
		return (
			<SettingsTransferSitePageLayout>
				<InvitationEmailSent
					siteSlug={ siteSlug }
					confirmationHash={ confirmationHash as string }
				/>
			</SettingsTransferSitePageLayout>
		);
	}

	return (
		<SettingsTransferSitePageLayout>
			<Card>
				<CardBody>
					{ currentStep === 0 && (
						<ConfirmNewOwnerForm
							siteSlug={ siteSlug }
							newOwnerEmail={ newOwnerEmail }
							handleSubmit={ handleConfirmNewOwner }
						/>
					) }
					{ currentStep === 1 && (
						<StartSiteTransferForm
							siteSlug={ siteSlug }
							newOwnerEmail={ newOwnerEmail }
							site={ site }
							isTransferring={ mutation.isPending }
							handleSubmit={ handleStartSiteTransfer }
							handleBack={ handleBack }
						/>
					) }
					{ currentStep === 2 && <EmailConfirmation userEmail={ user.email } /> }
				</CardBody>
			</Card>
		</SettingsTransferSitePageLayout>
	);
}
