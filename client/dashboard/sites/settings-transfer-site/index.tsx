import { useQuery } from '@tanstack/react-query';
import { notFound } from '@tanstack/react-router';
import { Card, CardBody, ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { siteQuery } from '../../app/queries';
import PageLayout from '../../components/page-layout';
import { useCanTransferSite } from '../hooks/use-can-transfer-site';
import SettingsPageHeader from '../settings-page-header';
import { ConfirmNewOwnerForm } from './confirm-new-owner-form';

export default function SettingsTransferSite( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useQuery( siteQuery( siteSlug ) );
	const canTransferSite = useCanTransferSite( { site } );

	// TODO: Integrate with the API.
	const handleConfirmNewOwner = ( event: React.FormEvent ) => {
		event.preventDefault();
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
					<ConfirmNewOwnerForm siteSlug={ siteSlug } handleSubmit={ handleConfirmNewOwner } />
				</CardBody>
			</Card>
		</PageLayout>
	);
}
