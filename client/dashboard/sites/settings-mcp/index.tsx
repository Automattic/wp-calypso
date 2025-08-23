import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	Card,
	CardBody,
	CheckboxControl,
	ExternalLink,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { siteBySlugQuery } from '../../app/queries/site';
import { siteSettingsQuery, siteSettingsMutation } from '../../app/queries/site-settings';
import PageLayout from '../../components/page-layout';
import SettingsPageHeader from '../settings-page-header';

// Mock data for MCP abilities - in a real implementation, this would come from the API
const MCP_ABILITIES = [
	{
		id: 'wpcom-mcp/site-posts-search',
		label: __( 'Site Posts Search' ),
		description: __( 'Allow AI assistants to search through your site posts.' ),
	},
	{
		id: 'wpcom-mcp/site-pages-search',
		label: __( 'Site Pages Search' ),
		description: __( 'Allow AI assistants to search through your site pages.' ),
	},
	{
		id: 'wpcom-mcp/site-comments-search',
		label: __( 'Site Comments Search' ),
		description: __( 'Allow AI assistants to search through your site comments.' ),
	},
	{
		id: 'wpcom-mcp/site-media-search',
		label: __( 'Site Media Search' ),
		description: __( 'Allow AI assistants to search through your site media.' ),
	},
];

export default function SettingsMcp( { siteSlug }: { siteSlug: string } ) {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: siteSettings } = useQuery( siteSettingsQuery( site.ID ) );
	const mutation = useMutation( siteSettingsMutation( site.ID ) );

	const [ formData, setFormData ] = useState( {
		mcp_enabled: siteSettings?.mcp_settings?.mcp_enabled ?? true,
		mcp_abilities: siteSettings?.mcp_settings?.mcp_abilities ?? {},
	} );

	const renderContent = () => {
		const isDirty =
			formData.mcp_enabled !== siteSettings?.mcp_settings?.mcp_enabled ||
			JSON.stringify( formData.mcp_abilities ) !==
				JSON.stringify( siteSettings?.mcp_settings?.mcp_abilities );

		const handleSubmit = ( e: React.FormEvent ) => {
			e.preventDefault();
			mutation.mutate(
				{
					mcp_settings: {
						mcp_enabled: formData.mcp_enabled,
						mcp_abilities: formData.mcp_abilities,
					},
				},
				{
					onSuccess: () => {
						createSuccessNotice( __( 'MCP settings saved.' ), { type: 'snackbar' } );
					},
					onError: () => {
						createErrorNotice( __( 'Failed to save MCP settings.' ), { type: 'snackbar' } );
					},
				}
			);
		};

		const handleMcpEnabledChange = ( enabled: boolean ) => {
			setFormData( ( prev ) => ( {
				...prev,
				mcp_enabled: enabled,
				// If disabling MCP, disable all abilities
				mcp_abilities: enabled ? prev.mcp_abilities : {},
			} ) );
		};

		const handleAbilityChange = ( abilityId: string, enabled: boolean ) => {
			setFormData( ( prev ) => ( {
				...prev,
				mcp_abilities: {
					...prev.mcp_abilities,
					[ abilityId ]: enabled,
				},
			} ) );
		};

		return (
			<Card>
				<CardBody>
					<form onSubmit={ handleSubmit }>
						<VStack spacing={ 4 }>
							<CheckboxControl
								__nextHasNoMarginBottom
								label={ __( 'Enable Model Context Protocol (MCP)' ) }
								help={ __(
									'Allow AI assistants to access your site data through the Model Context Protocol.'
								) }
								checked={ formData.mcp_enabled }
								onChange={ handleMcpEnabledChange }
							/>

							{ formData.mcp_enabled && (
								<VStack spacing={ 3 }>
									{ MCP_ABILITIES.map( ( ability ) => (
										<CheckboxControl
											key={ ability.id }
											__nextHasNoMarginBottom
											label={ ability.label }
											help={ ability.description }
											checked={ formData.mcp_abilities[ ability.id ] || false }
											onChange={ ( checked ) => handleAbilityChange( ability.id, checked ) }
										/>
									) ) }
								</VStack>
							) }

							<HStack justify="flex-start">
								<Button
									variant="primary"
									type="submit"
									isBusy={ mutation.isPending }
									disabled={ mutation.isPending || ! isDirty }
								>
									{ __( 'Save' ) }
								</Button>
							</HStack>
						</VStack>
					</form>
				</CardBody>
			</Card>
		);
	};

	return (
		<PageLayout
			size="small"
			header={
				<SettingsPageHeader
					title={ __( 'Model Context Protocol (MCP) Settings' ) }
					description={ createInterpolateElement(
						__(
							'Control how AI assistants can access your site data through the <mcpLink>Model Context Protocol</mcpLink>.'
						),
						{
							mcpLink: (
								// @ts-expect-error children prop is injected by createInterpolateElement
								// eslint-disable-next-line wpcalypso/i18n-unlocalized-url
								<ExternalLink href="https://modelcontextprotocol.io/" />
							),
						}
					) }
				/>
			}
		>
			{ renderContent() }
		</PageLayout>
	);
}
