import {
	bigSkyPluginQuery,
	sitePostByEmailSettingsMutation,
	sitePostByEmailSettingsQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Notice, Spinner, __experimentalVStack as VStack } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useAuth } from '../../app/auth';
import { useAppContext } from '../../app/context';
import { sitePlansRoute } from '../../app/router/sites';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import { Card, CardBody, CardDivider } from '../../components/card';
import ClipboardInputControl from '../../components/clipboard-input-control';
import RouterLinkButton from '../../components/router-link-button';
import { SectionHeader } from '../../components/section-header';
import { Text } from '../../components/text';
import {
	getAgentEmailAddress,
	getAgentEmailVCardDataUrl,
	getAgentEmailVCardFileName,
} from '../../utils/wordpress-agent-email';
import PreferencesLoginSiteDropdown from '../preferences-defaults/site-dropdown';
import type { Site } from '@automattic/api-core';

function getErrorMessage( error: unknown, fallback: string ): string {
	return error instanceof Error && error.message ? error.message : fallback;
}

function ViewPlansButton( { site }: { site: Site } ) {
	return (
		<RouterLinkButton
			__next40pxDefaultSize
			variant="primary"
			to={ sitePlansRoute.fullPath }
			params={ { siteSlug: site.slug } }
		>
			{ __( 'View plans' ) }
		</RouterLinkButton>
	);
}

function WordPressAgentEmailForSite( { site }: { site: Site } ) {
	const { recordTracksEvent } = useAnalytics();
	const { user } = useAuth();
	const pluginQuery = useQuery( bigSkyPluginQuery( site.ID ) );
	const isAvailable = pluginQuery.data?.available === true;
	const settingsQuery = useQuery( {
		...sitePostByEmailSettingsQuery( site ),
		enabled: isAvailable,
	} );
	const emailMutation = useMutation(
		withSnackbar( sitePostByEmailSettingsMutation( site ), {
			success: __( 'WordPress Agent email address enabled.' ),
			error: __( 'Failed to enable the WordPress Agent email address.' ),
		} )
	);

	const agentEmailAddress = getAgentEmailAddress( settingsQuery.data?.post_by_email_address );
	const vCardHref = agentEmailAddress
		? getAgentEmailVCardDataUrl( site.slug, agentEmailAddress )
		: undefined;
	const vCardFileName = getAgentEmailVCardFileName( site.slug );
	const error = pluginQuery.error || settingsQuery.error || emailMutation.error;
	const isLoading = pluginQuery.isLoading || ( isAvailable && settingsQuery.isLoading );

	const enableEmail = () => {
		emailMutation.mutate(
			{ post_by_email_address: 'create' },
			{
				onSuccess: () => {
					recordTracksEvent( 'calypso_wordpress_agent_email_enabled', {
						site_id: site.ID,
					} );
				},
			}
		);
	};

	if ( isLoading ) {
		return (
			<CardBody className="wordpress-agent-email__loading">
				<Spinner />
			</CardBody>
		);
	}

	if ( error ) {
		return (
			<CardBody>
				<Notice status="error" isDismissible={ false }>
					{ getErrorMessage( error, __( 'Could not load this site’s email connection.' ) ) }
				</Notice>
			</CardBody>
		);
	}

	if ( ! isAvailable ) {
		return (
			<CardBody className="wordpress-agent-connection__row">
				<SectionHeader
					level={ 3 }
					title={ __( 'Email isn’t available for this site' ) }
					description={ __(
						'Upgrade this site’s plan to enable a WordPress Agent email address.'
					) }
				/>
				<ViewPlansButton site={ site } />
			</CardBody>
		);
	}

	if ( ! agentEmailAddress ) {
		return (
			<CardBody className="wordpress-agent-connection__row">
				<SectionHeader
					level={ 3 }
					title={ __( 'Not connected on this site' ) }
					description={ __( 'Enable a private address for emailing this site’s WordPress Agent.' ) }
				/>
				<Button
					__next40pxDefaultSize
					variant="primary"
					onClick={ enableEmail }
					isBusy={ emailMutation.isPending }
					disabled={ emailMutation.isPending }
				>
					{ __( 'Enable email' ) }
				</Button>
			</CardBody>
		);
	}

	return (
		<CardBody>
			<VStack spacing={ 4 }>
				<div className="wordpress-agent-email__address-row">
					<ClipboardInputControl
						label={ __( 'AI agent email address' ) }
						value={ agentEmailAddress }
						readOnly
						onCopy={ () => {
							recordTracksEvent( 'calypso_wordpress_agent_email_address_copied', {
								site_id: site.ID,
							} );
						} }
					/>
					<Button
						__next40pxDefaultSize
						variant="secondary"
						href={ vCardHref }
						download={ vCardFileName }
						onClick={ () => {
							recordTracksEvent( 'calypso_wordpress_agent_email_vcard_downloaded', {
								site_id: site.ID,
							} );
						} }
					>
						{ __( 'Add to contacts' ) }
					</Button>
				</div>
				<Text as="p" variant="muted" className="wordpress-agent-email__sender">
					{ createInterpolateElement( __( 'Only responds to email from <email />.' ), {
						email: <strong>{ user.email }</strong>,
					} ) }
				</Text>
			</VStack>
		</CardBody>
	);
}

export default function WordPressAgentEmail() {
	const { recordTracksEvent } = useAnalytics();
	const { queries } = useAppContext();
	const sitesQuery = useQuery(
		queries.sitesQuery( { site_visibility: 'visible', include_a8c_owned: false } )
	);
	const sites =
		( sitesQuery.data as Site[] | undefined )?.filter(
			( site ) => site.capabilities?.manage_options !== false
		) ?? [];
	const [ selectedSiteId, setSelectedSiteId ] = useState< string | null >( null );
	const selectedSite =
		sites.find( ( site ) => site.ID.toString() === selectedSiteId ) ?? sites[ 0 ];

	const selectSite = ( siteId: string | null | undefined ) => {
		if ( ! siteId ) {
			return;
		}

		setSelectedSiteId( siteId );
		recordTracksEvent( 'calypso_wordpress_agent_email_site_selected', {
			site_id: Number( siteId ),
		} );
	};

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<SectionHeader
						level={ 3 }
						title={ __( 'Email' ) }
						description={ __(
							'Email WordPress Agent through a private address unique to each site.'
						) }
					/>
					<PreferencesLoginSiteDropdown
						sites={ sites }
						value={ selectedSite?.ID.toString() ?? '' }
						onChange={ selectSite }
						label={ __( 'Select site' ) }
						isLoading={ sitesQuery.isLoading }
						useSiteUrlAsLabel
					/>
					{ ! sitesQuery.isLoading && sites.length === 0 && (
						<Notice status="info" isDismissible={ false }>
							{ __( 'You do not have any sites that can use a WordPress Agent email address.' ) }
						</Notice>
					) }
				</VStack>
			</CardBody>
			{ selectedSite && (
				<>
					<CardDivider />
					<WordPressAgentEmailForSite key={ selectedSite.ID } site={ selectedSite } />
				</>
			) }
		</Card>
	);
}
