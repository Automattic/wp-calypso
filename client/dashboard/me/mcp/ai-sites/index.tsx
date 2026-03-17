import { useQuery } from '@tanstack/react-query';
import {
	Button,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import Breadcrumbs from '../../../app/breadcrumbs';
import { useAppContext } from '../../../app/context';
import { Card, CardBody } from '../../../components/card';
import ComponentViewTracker from '../../../components/component-view-tracker';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { SectionHeader } from '../../../components/section-header';
import SiteIcon from '../../../components/site-icon';
import PreferencesLoginSiteDropdown from '../../preferences-primary-site/site-dropdown';
import type { Site } from '@automattic/api-core';

export default function McpAiSites() {
	const { queries } = useAppContext();
	const sitesQueryResult = useQuery(
		queries.sitesQuery( { site_visibility: 'visible', include_a8c_owned: false } )
	);
	const sites = ( sitesQueryResult.data as Site[] | undefined ) ?? [];
	const isSiteListLoading = sitesQueryResult.isLoading;

	const [ selectedSiteId, setSelectedSiteId ] = useState< string | null >( null );

	// AI assistant enabled sites are not yet backed by a user setting.
	// This is a UI stub — actual site list will be wired to data when available.
	const enabledSites: Array< { id: number; name: string; displayUrl: string; site: Site | null } > =
		[];

	const availableSitesForPicker = sites.filter(
		( site: Site ) => ! enabledSites.some( ( s ) => s.id === site.ID )
	);

	const handleSitePickerSelect = ( siteIdStr: string | null | undefined ) => {
		if ( siteIdStr ) {
			// TODO: wire to mutation when account-level AI assistant user setting is available
			setSelectedSiteId( null );
		}
	};

	const isAiEnabled = false;

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'Add AI assistant to sites' ) }
					description={
						isAiEnabled
							? __( 'The WordPress.com AI assistant is enabled. Add site exceptions here.' )
							: __( 'The WordPress.com AI assistant is disabled. Add it to individual sites here.' )
					}
				/>
			}
		>
			<ComponentViewTracker eventName="calypso_dashboard_mcp_ai_sites_view" />
			<VStack spacing={ 4 }>
				<Card>
					<CardBody>
						<VStack spacing={ 4 }>
							<SectionHeader
								level={ 3 }
								title={ __( 'Add a site' ) }
								description={ __( 'Search for a site to enable the AI assistant.' ) }
							/>
							<PreferencesLoginSiteDropdown
								sites={ availableSitesForPicker }
								isLoading={ isSiteListLoading }
								value={ selectedSiteId ?? '' }
								onChange={ handleSitePickerSelect }
								hideLabelFromVision
							/>
						</VStack>
					</CardBody>
				</Card>

				{ enabledSites.length > 0 && (
					<VStack spacing={ 2 }>
						<SectionHeader
							level={ 3 }
							title={ __( 'Enabled sites' ) }
							description={ __( 'These sites have the AI assistant enabled.' ) }
						/>
						<Card>
							<CardBody>
								<VStack spacing={ 3 }>
									{ enabledSites.map( ( site ) => (
										<HStack key={ site.id } justify="space-between" alignment="center">
											<HStack spacing={ 3 } alignment="center" justify="flex-start">
												{ site.site && <SiteIcon site={ site.site } size={ 32 } /> }
												<VStack spacing={ 0 }>
													<Text weight={ 500 } size={ 14 }>
														{ site.name }
													</Text>
													<Text variant="muted" size={ 12 }>
														{ site.displayUrl }
													</Text>
												</VStack>
											</HStack>
											<Button
												variant="secondary"
												size="compact"
												onClick={ () => {
													// TODO: wire to mutation when AI assistant user setting is available
												} }
											>
												{ __( 'Remove' ) }
											</Button>
										</HStack>
									) ) }
								</VStack>
							</CardBody>
						</Card>
					</VStack>
				) }
			</VStack>
		</PageLayout>
	);
}
