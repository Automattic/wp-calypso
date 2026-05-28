import './style.scss';

import { HostingFeatures, type Site } from '@automattic/api-core';
import {
	bigSkyPluginMutation,
	bigSkyPluginQuery,
	siteBySlugQuery,
	sitePostByEmailSettingsMutation,
	sitePostByEmailSettingsQuery,
	userSettingsMutation,
	userSettingsQuery,
} from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
	Icon,
	ToggleControl,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import {
	brush,
	check,
	comment,
	connection,
	help,
	image,
	pencil,
	send,
	seen,
	termDescription,
} from '@wordpress/icons';
import { useState } from 'react';
import {
	getAccountMcpAbilities,
	getSiteContextToolIds,
	getSiteLevelEnabled,
	getSiteMcpAbilities,
	mergeSiteMcpAbilities,
} from '../../../me/mcp/utils';
import { useAnalytics } from '../../app/analytics';
import Breadcrumbs from '../../app/breadcrumbs';
import { useHelpCenter } from '../../app/help-center';
import { Card, CardBody, CardDivider, CardFooter } from '../../components/card';
import ClipboardInputControl from '../../components/clipboard-input-control';
import ConfirmModal from '../../components/confirm-modal';
import InlineSupportLink from '../../components/inline-support-link';
import Notice from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { SectionHeader } from '../../components/section-header';
import SummaryButton from '../../components/summary-button';
import { SummaryButtonList } from '../../components/summary-button-list';
import { isWriteTool } from '../../me/mcp/categories';
import { wpcomLink } from '../../utils/link';
import UpsellCallout from '../hosting-feature-gated-with-callout/upsell';
import upsellIllustrationUrl from './upsell-illustration.svg';

interface McpAbility {
	title: string;
	description: string;
	enabled: boolean;
	readonly?: boolean;
	visible?: boolean;
}

function getReadBadge( tools: Array< [ string, McpAbility ] > ) {
	if ( tools.length === 0 ) {
		return { text: __( 'All enabled' ), intent: 'success' as const };
	}
	const enabledCount = tools.filter( ( [ , tool ] ) => tool.enabled ).length;
	if ( enabledCount === tools.length ) {
		return { text: __( 'All enabled' ), intent: 'success' as const };
	}
	if ( enabledCount === 0 ) {
		return { text: __( 'Disabled' ) };
	}
	return {
		/* translators: %1$d is the number of enabled tools, %2$d is the total number of tools */
		text: sprintf( __( '%1$d of %2$d enabled' ), enabledCount, tools.length ),
		intent: 'info' as const,
	};
}

function getWriteBadge( tools: Array< [ string, McpAbility ] > ) {
	if ( tools.length === 0 ) {
		return { text: __( 'All enabled' ), intent: 'success' as const };
	}
	const enabledCount = tools.filter( ( [ , tool ] ) => tool.enabled ).length;
	if ( enabledCount === tools.length ) {
		return { text: __( 'All enabled' ), intent: 'success' as const };
	}
	if ( enabledCount === 0 ) {
		return { text: __( 'Disabled' ) };
	}
	return {
		/* translators: %1$d is the number of enabled tools, %2$d is the total number of tools */
		text: sprintf( __( '%1$d of %2$d enabled' ), enabledCount, tools.length ),
		intent: 'info' as const,
	};
}

const features = [
	__( 'Get answers where you work so you‘re unstuck faster' ),
	__( 'Update your site design with less effort' ),
	__( 'Draft and revise content in one place' ),
	__( 'Create beautiful images without leaving WordPress' ),
];

const TELEGRAM_CONNECTION_PATH = '/me/developer';

const INVALID_POST_BY_EMAIL_VALUES = new Set( [
	'',
	'null',
	'noop',
	'create',
	'regenerate',
	'delete',
] );

export function getAgentEmailAddress( postByEmailAddress?: string | null ) {
	const trimmedAddress = postByEmailAddress?.trim() ?? '';
	const normalizedAddress = trimmedAddress.toLowerCase();

	if ( INVALID_POST_BY_EMAIL_VALUES.has( normalizedAddress ) ) {
		return null;
	}

	const [ localPart, domain, ...extraParts ] = trimmedAddress.split( '@' );

	if ( ! localPart || ! domain || extraParts.length > 0 ) {
		return null;
	}

	const agentLocalPart = localPart.startsWith( 'agent+' ) ? localPart : `agent+${ localPart }`;

	return `${ agentLocalPart }@${ domain }`;
}

function escapeVCardValue( value: string ) {
	return value
		.replace( /\\/g, '\\\\' )
		.replace( /\r\n|\r|\n/g, '\\n' )
		.replace( /,/g, '\\,' )
		.replace( /;/g, '\\;' );
}

export function getAgentEmailVCard( siteDomain: string, agentEmailAddress: string ) {
	const escapedSiteDomain = escapeVCardValue( siteDomain );
	const escapedAgentEmailAddress = escapeVCardValue( agentEmailAddress );

	return [
		'BEGIN:VCARD',
		'VERSION:3.0',
		`FN:${ escapedSiteDomain }`,
		`N:${ escapedSiteDomain };;;;`,
		`EMAIL;TYPE=INTERNET:${ escapedAgentEmailAddress }`,
		'END:VCARD',
		'',
	].join( '\r\n' );
}

function getVCardDataUrl( siteDomain: string, agentEmailAddress: string ) {
	return `data:text/vcard;charset=utf-8,${ encodeURIComponent(
		getAgentEmailVCard( siteDomain, agentEmailAddress )
	) }`;
}

function getVCardFileName( siteDomain: string ) {
	const fileName = siteDomain.replace( /[^a-z0-9.-]+/gi, '-' ).replace( /^-+|-+$/g, '' );

	return `${ fileName || 'ai-agent' }.vcf`;
}

function EmailAssistantCard( {
	site,
	recordTracksEvent,
}: {
	site: Site;
	recordTracksEvent: ReturnType< typeof useAnalytics >[ 'recordTracksEvent' ];
} ) {
	const { data: postByEmailSettings, isLoading: isPostByEmailSettingsLoading } = useQuery(
		sitePostByEmailSettingsQuery( site )
	);
	const agentEmailAddress = getAgentEmailAddress( postByEmailSettings?.post_by_email_address );
	const isAgentEmailEnabled = !! agentEmailAddress;
	const vCardHref = agentEmailAddress ? getVCardDataUrl( site.slug, agentEmailAddress ) : undefined;
	const vCardFileName = getVCardFileName( site.slug );

	const emailAddressMutation = useMutation( {
		...sitePostByEmailSettingsMutation( site ),
		meta: {
			snackbar: {
				success: __( 'AI agent email address settings saved.' ),
				error: __( 'Failed to save AI agent email address settings.' ),
			},
		},
	} );
	const isEmailAddressActionDisabled =
		isPostByEmailSettingsLoading || emailAddressMutation.isPending;

	const handleEmailAddressToggle = ( enabled: boolean ) => {
		emailAddressMutation.mutate(
			{
				post_by_email_address: enabled ? 'create' : 'delete',
			},
			{
				onSuccess: () => {
					recordTracksEvent( 'calypso_dashboard_ai_tool_email_agent_toggled', {
						enabled,
						site_id: site.ID,
					} );
				},
			}
		);
	};

	const handleRegenerateAddress = () => {
		emailAddressMutation.mutate(
			{
				post_by_email_address: 'regenerate',
			},
			{
				onSuccess: () => {
					recordTracksEvent( 'calypso_dashboard_ai_tool_email_agent_regenerated', {
						site_id: site.ID,
					} );
				},
			}
		);
	};

	const handleCopyAddress = () => {
		recordTracksEvent( 'calypso_dashboard_ai_tool_email_agent_copied', {
			site_id: site.ID,
		} );
	};

	const handleAddToContacts = () => {
		recordTracksEvent( 'calypso_dashboard_ai_tool_email_agent_vcard_downloaded', {
			site_id: site.ID,
		} );
	};

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<SectionHeader
						title={ __( 'Email your assistant' ) }
						description={ __( 'Email this site’s AI agent using a private address.' ) }
						level={ 3 }
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						checked={ isAgentEmailEnabled }
						disabled={ isEmailAddressActionDisabled }
						label={ __( 'Enable AI agent email address' ) }
						onChange={ handleEmailAddressToggle }
					/>
					<Notice density="medium">
						{ __(
							'Enabling this also enables Post by Email. Disabling it deletes the Post by Email address, so both Post by Email and this AI agent address will stop working.'
						) }
					</Notice>
					{ agentEmailAddress && (
						<VStack spacing={ 3 }>
							<ClipboardInputControl
								label={ __( 'AI agent email address' ) }
								value={ agentEmailAddress }
								readOnly
								onCopy={ handleCopyAddress }
							/>
							<HStack justify="flex-start">
								<Button
									variant="secondary"
									href={ vCardHref }
									download={ vCardFileName }
									onClick={ handleAddToContacts }
								>
									{ __( 'Add to contacts' ) }
								</Button>
								<Button
									variant="secondary"
									isBusy={ emailAddressMutation.isPending }
									disabled={ isEmailAddressActionDisabled }
									onClick={ handleRegenerateAddress }
								>
									{ __( 'Regenerate address' ) }
								</Button>
							</HStack>
						</VStack>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
}

export default function AIToolsSettings( { siteSlug }: { siteSlug: string } ) {
	const { recordTracksEvent } = useAnalytics();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: pluginStatus } = useSuspenseQuery( bigSkyPluginQuery( site.ID ) );

	const isEnabled = pluginStatus?.enabled ?? false;
	const isAvailable = pluginStatus?.available ?? false;
	const isFreeTrial = pluginStatus?.on_free_trial ?? false;

	const [ isConfirmModalOpen, setIsConfirmModalOpen ] = useState( false );

	const { setShowHelpCenter, setNavigateToRoute } = useHelpCenter();

	// MCP settings for this site
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );
	const isMcpEnabled = getSiteLevelEnabled( userSettings || {}, site.ID );

	const accountAbilities = getAccountMcpAbilities( userSettings || {} );
	const siteContextToolIds = getSiteContextToolIds( userSettings || {} );
	const siteAbilities = getSiteMcpAbilities( userSettings || {}, site.ID );
	const siteAccountAbilities = siteContextToolIds.size
		? Object.fromEntries(
				Object.entries( accountAbilities ).filter( ( [ id ] ) => siteContextToolIds.has( id ) )
		  )
		: accountAbilities;
	const mcpAbilities = mergeSiteMcpAbilities( siteAccountAbilities, siteAbilities );
	const availableTools = (
		Object.entries( mcpAbilities ) as Array< [ string, McpAbility ] >
	 ).filter( ( [ , tool ] ) => tool.visible !== false );
	const readTools = availableTools.filter( ( [ toolId, tool ] ) => ! isWriteTool( toolId, tool ) );
	const writeTools = availableTools.filter( ( [ toolId, tool ] ) => isWriteTool( toolId, tool ) );
	// When there are no site-specific overrides, use site_level_enabled_default as the effective
	// state. True when account MCP is on for sites, false when disabled.
	const hasSiteAbilityOverrides = Object.keys( siteAbilities ).length > 0;
	const defaultToolEnabled = userSettings?.mcp_abilities?.site_level_enabled_default ?? false;
	const defaultBadge = defaultToolEnabled
		? { text: __( 'All enabled' ), intent: 'success' as const }
		: { text: __( 'Disabled' ) };
	const readBadge = hasSiteAbilityOverrides ? getReadBadge( readTools ) : defaultBadge;
	const writeBadge = hasSiteAbilityOverrides ? getWriteBadge( writeTools ) : defaultBadge;
	const mcpMutation = useMutation( {
		...userSettingsMutation(),
		meta: {
			snackbar: {
				success: isMcpEnabled
					? __( 'MCP access disabled for this site.' )
					: __( 'MCP access enabled for this site.' ),
				error: __( 'Failed to save MCP settings.' ),
			},
		},
	} );

	const handleMcpToggle = ( enabled: boolean ) => {
		const abilities: Record< string, boolean > = {};
		if ( enabled ) {
			// Auto-enable all read tools; leave write tools unset (not explicitly disabled).
			readTools.forEach( ( [ toolId ] ) => {
				abilities[ toolId ] = true;
			} );
		}
		// When disabling, send abilities: {} to clear all site-level tool access.
		mcpMutation.mutate(
			{
				mcp_abilities: {
					sites: [
						{
							blog_id: site.ID,
							site_level_enabled: enabled,
							abilities,
						},
					],
				},
			},
			{
				onSuccess: () => {
					recordTracksEvent( 'calypso_dashboard_mcp_site_toggled', {
						enabled,
						site_id: site.ID,
					} );
				},
			}
		);
	};

	const mutation = useMutation( {
		...bigSkyPluginMutation( site.ID ),
		meta: {
			snackbar: {
				success: ! isEnabled ? __( 'AI assistant enabled.' ) : __( 'AI assistant disabled.' ),
				error: __( 'Failed to save AI assistant settings.' ),
			},
		},
	} );

	const description = isAvailable
		? createInterpolateElement(
				__(
					'Create content, transform designs, generate images, and get instant help with AI. <learnMoreLink />'
				),
				{
					learnMoreLink: <InlineSupportLink supportContext="ai-tools" />,
				}
		  )
		: undefined;

	const handleToggle = ( enable: boolean ) => {
		if ( ! enable && isFreeTrial && ! isConfirmModalOpen ) {
			setIsConfirmModalOpen( true );
			return;
		}

		if ( enable ) {
			recordTracksEvent( 'calypso_dashboard_ai_tool_ai_assistant_enabled' );
		} else {
			recordTracksEvent( 'calypso_dashboard_ai_tool_ai_assistant_disabled' );
		}

		mutation.mutate(
			{ enable },
			{
				onSuccess: () => {
					setIsConfirmModalOpen( false );
				},
			}
		);
	};

	const renderContent = () => {
		if ( ! isAvailable ) {
			return (
				<UpsellCallout
					site={ site }
					feature={ HostingFeatures.BIG_SKY }
					upsellId="ai-tools"
					upsellPlanRequirement="any"
					upsellTitle={ __( 'Your dream site is just a prompt away' ) }
					upsellDescription={ __(
						'Get AI-powered assistance to help you build, edit, and redesign your site with ease.'
					) }
					upsellIcon={ comment }
					upsellImage={ upsellIllustrationUrl }
				/>
			);
		}

		return (
			<>
				<Card>
					<CardBody>
						<VStack spacing={ 4 }>
							<SectionHeader
								title={ __( 'AI assistant' ) }
								description={ __( 'Helps with site setup, content, design, and more.' ) }
								level={ 3 }
							/>
							<ToggleControl
								__nextHasNoMarginBottom
								checked={ isEnabled }
								disabled={ mutation.isPending }
								label={ __( 'Enable AI assistant' ) }
								onChange={ handleToggle }
							/>
						</VStack>
					</CardBody>
					{ ! isEnabled && (
						<CardFooter className="ai-tools-settings__features-footer">
							<VStack as="ul" spacing={ 1 } style={ { padding: 0, margin: 0 } }>
								{ features.map( ( feature, i ) => (
									<HStack key={ i } as="li" justify="flex-start" spacing={ 3 }>
										<Icon
											icon={ check }
											fill="var(--dashboard__foreground-color-success)"
											style={ { flexShrink: 0, alignSelf: 'flex-start' } }
										/>
										<Text>{ feature }</Text>
									</HStack>
								) ) }
							</VStack>
						</CardFooter>
					) }
				</Card>
				<EmailAssistantCard site={ site } recordTracksEvent={ recordTracksEvent } />
				{ config.isEnabled( 'dolly/telegram' ) && (
					<SummaryButton
						href={ wpcomLink( TELEGRAM_CONNECTION_PATH ) }
						title={ __( 'Connect Telegram' ) }
						description={ __(
							'Connect your WordPress.com account to Telegram. This connection is shared across multiple sites.'
						) }
						decoration={ <Icon icon={ send } size={ 24 } /> }
						onClick={ () => {
							recordTracksEvent( 'calypso_dashboard_ai_tool_connect_telegram_click', {
								site_id: site.ID,
							} );
						} }
					/>
				) }
				{ config.isEnabled( 'mcp-settings' ) && (
					<>
						<Card className="mcp-settings__access-card">
							<CardBody>
								<VStack spacing={ 4 }>
									<SectionHeader
										title={ __( 'External AI agent access' ) }
										description={ __( 'Allow external AI agents to access this site via MCP.' ) }
										level={ 3 }
									/>
									<ToggleControl
										__nextHasNoMarginBottom
										checked={ isMcpEnabled }
										disabled={ mcpMutation.isPending }
										label={ __( 'Enable MCP access for this site' ) }
										onChange={ handleMcpToggle }
									/>
								</VStack>
							</CardBody>
							{ isMcpEnabled && (
								<>
									<CardDivider className="mcp-settings__sub-divider" />
									<RouterLinkSummaryButton
										to={ `/sites/${ siteSlug }/settings/ai-tools/read` }
										density="medium"
										title={ __( 'Read' ) }
										decoration={ <Icon icon={ seen } size={ 24 } /> }
										badges={ [ readBadge ] }
									/>
									<RouterLinkSummaryButton
										to={ `/sites/${ siteSlug }/settings/ai-tools/write` }
										density="medium"
										title={ __( 'Write' ) }
										decoration={ <Icon icon={ pencil } size={ 24 } /> }
										badges={ [ writeBadge ] }
									/>
								</>
							) }
						</Card>
						{ isMcpEnabled && (
							<RouterLinkSummaryButton
								to={ `/sites/${ siteSlug }/settings/ai-tools/setup` }
								title={ __( 'Connect external AI agent' ) }
								description={ __( 'Get instructions for connecting your external AI assistant.' ) }
								decoration={ <Icon icon={ connection } size={ 24 } /> }
							/>
						) }
					</>
				) }
				{ isFreeTrial && (
					<ConfirmModal
						isOpen={ isConfirmModalOpen }
						onCancel={ () => setIsConfirmModalOpen( false ) }
						onConfirm={ () => handleToggle( false ) }
						confirmButtonProps={ {
							label: __( 'Disable AI assistant' ),
							isBusy: mutation.isPending,
							disabled: mutation.isPending,
						} }
					>
						{ __(
							'You are on a free trial. If you disable AI assistant, you will not be able to turn it back on without a paid plan.'
						) }
					</ConfirmModal>
				) }
				{ isEnabled && (
					<VStack spacing={ 3 }>
						<SectionHeader title={ __( 'Ways to get started' ) } level={ 3 } />
						<SummaryButtonList>
							<SummaryButton
								title={ __( 'Get answers' ) }
								decoration={ <Icon icon={ help } /> }
								onClick={ () => {
									recordTracksEvent( 'calypso_dashboard_ai_tool_get_answers_click' );
									setNavigateToRoute( '/odie' );
									setShowHelpCenter( true );
								} }
							/>
							<SummaryButton
								href={ `${ site.options?.admin_url }site-editor.php?canvas=edit` }
								title={ __( 'Update your site design' ) }
								decoration={ <Icon icon={ brush } /> }
								onClick={ () => {
									recordTracksEvent( 'calypso_dashboard_ai_tool_edit_site_click' );
								} }
							/>
							<SummaryButton
								href={ `${ site.options?.admin_url }post-new.php` }
								title={ __( 'Draft and revise content' ) }
								decoration={ <Icon icon={ termDescription } /> }
								onClick={ () => {
									recordTracksEvent( 'calypso_dashboard_ai_tool_draft_post_click' );
								} }
							/>
							<SummaryButton
								href={ `${ site.options?.admin_url }upload.php?ai-assistant` }
								title={ __( 'Create beautiful images' ) }
								decoration={ <Icon icon={ image } /> }
								onClick={ () => {
									recordTracksEvent( 'calypso_dashboard_ai_tool_create_images_click' );
								} }
							/>
						</SummaryButtonList>
					</VStack>
				) }
			</>
		);
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'AI tools' ) }
					description={ description }
				/>
			}
		>
			{ renderContent() }
		</PageLayout>
	);
}
