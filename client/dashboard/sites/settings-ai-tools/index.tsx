import { HostingFeatures } from '@automattic/api-core';
import {
	bigSkyPluginMutation,
	bigSkyPluginQuery,
	siteBySlugQuery,
	siteSettingsQuery,
	siteSettingsMutation,
} from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Icon,
	ToggleControl,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { check, comment, connection, pencil, seen } from '@wordpress/icons';
import { useCallback, useRef, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import Breadcrumbs from '../../app/breadcrumbs';
import { Card, CardBody, CardFooter, CardHeader } from '../../components/card';
import ConfirmModal from '../../components/confirm-modal';
import InlineSupportLink from '../../components/inline-support-link';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { SectionHeader } from '../../components/section-header';
import '../../components/summary-button-list/style.scss';
import { getPermissionLevel } from '../../me/mcp/categories';
import UpsellCallout from '../hosting-feature-gated-with-callout/upsell';
import { getMockMcpAbilities, updateMockMcpAbilities } from './mock-mcp-abilities';
import upsellIllustrationUrl from './upsell-illustration.svg';
import type { SiteMcpAbility } from '@automattic/api-core';
import type { SummaryButtonBadgeProps } from '@automattic/components/src/summary-button/types';

const features = [
	__( 'Get answers where you work so you\u2019re unstuck faster' ),
	__( 'Update your site design with less effort' ),
	__( 'Draft and revise content in one place' ),
	__( 'Create beautiful images without leaving WordPress' ),
];

export default function AIToolsSettings( { siteSlug }: { siteSlug: string } ) {
	const { recordTracksEvent } = useAnalytics();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: pluginStatus } = useSuspenseQuery( bigSkyPluginQuery( site.ID ) );

	const isEnabled = pluginStatus?.enabled ?? false;
	const isAvailable = pluginStatus?.available ?? false;
	const isFreeTrial = pluginStatus?.on_free_trial ?? false;

	const [ isConfirmModalOpen, setIsConfirmModalOpen ] = useState( false );

	const mutation = useMutation( {
		...bigSkyPluginMutation( site.ID ),
		meta: {
			snackbar: {
				success: ! isEnabled ? __( 'AI assistant enabled.' ) : __( 'AI assistant disabled.' ),
				error: __( 'Failed to save AI assistant settings.' ),
			},
		},
	} );

	// MCP site-level data — fall back to localStorage mock when API has no abilities.
	const { data: siteSettings } = useQuery( siteSettingsQuery( site.ID ) );
	const apiAbilities = siteSettings?.mcp_abilities;
	const useMock = ! apiAbilities || Object.keys( apiAbilities ).length === 0;
	const [ mockAbilities, setMockAbilities ] = useState( getMockMcpAbilities );

	const mcpAbilities = useMock ? mockAbilities : apiAbilities;
	const availableTools = Object.entries( mcpAbilities );
	const enabledToolsCount = Object.values( mcpAbilities ).filter( ( tool ) => tool.enabled ).length;
	const anyToolsEnabled = enabledToolsCount > 0;

	// MCP toggle mutation (real API) — only used when we have real data.
	const mcpToggleAllRef = useRef( false );
	const mcpMutation = useMutation( {
		...siteSettingsMutation( site.ID ),
		onSettled: () => {
			mcpToggleAllRef.current = false;
		},
		meta: {
			snackbar: {
				success: __( 'MCP settings saved.' ),
				error: __( 'Failed to save MCP settings.' ),
			},
		},
	} );

	const handleMcpToggleAll = useCallback(
		( enabled: boolean ) => {
			if ( mcpToggleAllRef.current ) {
				return;
			}
			mcpToggleAllRef.current = true;

			const updates: Record< string, boolean > = {};
			Object.entries( mcpAbilities ).forEach( ( [ toolId, tool ] ) => {
				if ( enabled ) {
					const level = getPermissionLevel( tool );
					const shouldEnable = level === 'read';
					if ( tool.enabled !== shouldEnable ) {
						updates[ toolId ] = shouldEnable;
					}
				} else if ( tool.enabled ) {
					updates[ toolId ] = false;
				}
			} );

			if ( Object.keys( updates ).length === 0 ) {
				mcpToggleAllRef.current = false;
				return;
			}

			if ( useMock ) {
				setMockAbilities( updateMockMcpAbilities( updates ) );
				mcpToggleAllRef.current = false;
			} else {
				mcpMutation.mutate( { mcp_abilities: updates } as any );
			}
		},
		[ mcpAbilities, useMock, mcpMutation ]
	);

	// Group MCP tools by permission level
	const permissionGroups: Record< string, Array< [ string, SiteMcpAbility ] > > = {};
	availableTools.forEach( ( [ toolId, tool ] ) => {
		const level = getPermissionLevel( tool );
		if ( ! permissionGroups[ level ] ) {
			permissionGroups[ level ] = [];
		}
		permissionGroups[ level ].push( [ toolId, tool ] );
	} );
	const readTools = permissionGroups.read || [];
	const writeTools = [ ...( permissionGroups.write || [] ), ...( permissionGroups.manage || [] ) ];

	const getBadgeText = ( enabledCount: number, totalCount: number ): string => {
		if ( enabledCount === totalCount ) {
			return __( 'All enabled' );
		}
		if ( enabledCount === 0 ) {
			return __( 'Disabled' );
		}
		return sprintf(
			/* translators: %1$d is enabled count, %2$d is total */
			__( '%1$d of %2$d enabled' ),
			enabledCount,
			totalCount
		);
	};

	const getBadgeIntent = (
		enabledCount: number,
		totalCount: number
	): 'success' | 'info' | 'default' => {
		if ( enabledCount === totalCount ) {
			return 'success';
		}
		if ( enabledCount > 0 ) {
			return 'info';
		}
		return 'default';
	};

	const badgesFor = ( tools: Array< [ string, SiteMcpAbility ] > ): SummaryButtonBadgeProps[] => {
		const count = tools.filter( ( [ , tool ] ) => tool.enabled ).length;
		return [
			{
				text: getBadgeText( count, tools.length ),
				intent: getBadgeIntent( count, tools.length ),
			},
		];
	};

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
						<CardFooter style={ { background: '#FAFAFA' } }>
							<VStack as="ul" spacing={ 1 } style={ { padding: 0, margin: 0 } }>
								{ features.map( ( feature, i ) => (
									<HStack key={ i } as="li" justify="flex-start" spacing={ 3 }>
										<Icon
											icon={ check }
											fill="var(--dashboard__foreground-color-success"
											style={ { flexShrink: 0, alignSelf: 'flex-start' } }
										/>
										<Text>{ feature }</Text>
									</HStack>
								) ) }
							</VStack>
						</CardFooter>
					) }
				</Card>
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
				{ config.isEnabled( 'mcp-settings' ) && (
					<Card className="dashboard-summary-button-list has-density-medium">
						<CardHeader>
							<VStack spacing={ 4 }>
								<SectionHeader
									level={ 3 }
									title={ __( 'External AI agent access' ) }
									description={ __( 'Allow external AI agents to access this site via MCP.' ) }
								/>
								<ToggleControl
									__nextHasNoMarginBottom
									checked={ anyToolsEnabled }
									disabled={ mcpMutation.isPending }
									onChange={ handleMcpToggleAll }
									label={ __( 'Enable MCP access' ) }
								/>
							</VStack>
						</CardHeader>
						{ anyToolsEnabled && (
							<CardBody
								className="dashboard-summary-button-list__children-list-wrapper"
								style={
									mcpMutation.isPending ? { opacity: 0.5, pointerEvents: 'none' } : undefined
								}
							>
								<ul className="dashboard-summary-button-list__children-list">
									{ readTools.length > 0 && (
										<li className="dashboard-summary-button-list__children-list-item">
											<RouterLinkSummaryButton
												to={ `/sites/${ siteSlug }/settings/ai-tools/mcp/read` }
												title={ __( 'Read' ) }
												decoration={ <Icon icon={ seen } /> }
												badges={ badgesFor( readTools ) }
												density="medium"
											/>
										</li>
									) }
									{ writeTools.length > 0 && (
										<li className="dashboard-summary-button-list__children-list-item">
											<RouterLinkSummaryButton
												to={ `/sites/${ siteSlug }/settings/ai-tools/mcp/write` }
												title={ __( 'Write' ) }
												decoration={ <Icon icon={ pencil } /> }
												badges={ badgesFor( writeTools ) }
												density="medium"
											/>
										</li>
									) }
								</ul>
							</CardBody>
						) }
					</Card>
				) }
				{ config.isEnabled( 'mcp-settings' ) && anyToolsEnabled && (
					<RouterLinkSummaryButton
						to={ `/sites/${ siteSlug }/settings/ai-tools/mcp/setup` }
						title={ __( 'Connect external AI agent' ) }
						description={ __( 'Get instructions for connecting your external AI agent.' ) }
						decoration={ <Icon icon={ connection } /> }
					/>
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
