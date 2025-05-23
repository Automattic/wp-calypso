import { useQuery } from '@tanstack/react-query';
import { notFound } from '@tanstack/react-router';
import { Card, CardBody, ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { siteQuery } from '../../app/queries';
import PageLayout from '../../components/page-layout';
import { useCanTransferSite } from '../hooks/use-can-transfer-site';
import SettingsPageHeader from '../settings-page-header';
import { ConfirmNewOwnerForm } from './confirm-new-owner-form';
import { StartSiteTransferForm } from './start-site-transfer-form';

export default function SettingsTransferSite( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useQuery( siteQuery( siteSlug ) );
	const canTransferSite = useCanTransferSite( { site } );
	const [ currentStep, setCurrentStep ] = useState( 0 );
	const [ stepsData, setStepsData ] = useState( [] );
	const [ newOwnerEmail, setNewOwnerEmail ] = useState( '' );

	const handleBack = () => setCurrentStep( ( step ) => Math.max( step - 1, 0 ) );

	const handleForward = () => setCurrentStep( ( step ) => step + 1 );

	// TODO: Integrate with the API.
	const handleConfirmNewOwner = ( event: React.FormEvent ) => {
		event.preventDefault();
		setNewOwnerEmail( '' );
		setStepsData( [] );
		handleForward();
	};

	const handleStartSiteTransfer = ( event: React.FormEvent ) => {
		event.preventDefault();
		setStepsData( [] );
		handleForward();
	};

	if ( ! site ) {
		return null;
	}

	if ( ! canTransferSite ) {
		throw notFound();
	}

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
			<Card>
				<CardBody>
					{ currentStep === 0 && (
						<ConfirmNewOwnerForm
							initialData={ stepsData[ 0 ] }
							siteSlug={ siteSlug }
							handleSubmit={ handleConfirmNewOwner }
						/>
					) }
					{ currentStep === 1 && (
						<StartSiteTransferForm
							initialData={ stepsData[ 1 ] }
							siteSlug={ siteSlug }
							newOwnerEmail={ newOwnerEmail }
							handleSubmit={ handleStartSiteTransfer }
							handleBack={ handleBack }
						/>
					) }
				</CardBody>
			</Card>
		</PageLayout>
	);
}
