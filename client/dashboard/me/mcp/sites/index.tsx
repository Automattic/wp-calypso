import { userSettingsQuery, userSettingsMutation } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { __experimentalVStack as VStack, ComboboxControl, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { getDisabledSiteIds } from '../../../../me/mcp/utils';
import Breadcrumbs from '../../../app/breadcrumbs';
import { useAppContext } from '../../../app/context';
import { ActionList } from '../../../components/action-list';
import { Card, CardBody } from '../../../components/card';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { SectionHeader } from '../../../components/section-header';
import { getSiteDisplayName } from '../../../utils/site-name';
import type { Site } from '@automattic/api-core';

export default function McpSites() {
	const { queries } = useAppContext();
	const sitesQueryResult = useQuery(
		queries.sitesQuery( { site_visibility: 'visible', include_a8c_owned: false } )
	);
	const sites = ( sitesQueryResult.data as Site[] | undefined ) ?? [];
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );

	const disabledSiteIds = getDisabledSiteIds( userSettings || {} );
	const disabledSites = disabledSiteIds.map( ( siteId ) => {
		const site = sites.find( ( siteEntry ) => siteEntry.ID === siteId );
		const name = site ? getSiteDisplayName( site ) : `Site ID: ${ siteId }`;
		const domain = site?.URL ? site.URL.replace( /^https?:\/\//, '' ) : '';
		return { id: siteId, name, domain };
	} );

	const mutation = useMutation( {
		...userSettingsMutation(),
		meta: {
			snackbar: {
				success: __( 'MCP settings saved.' ),
				error: __( 'Failed to save MCP settings.' ),
			},
		},
	} );

	// ComboboxControl options — exclude already-excepted sites.
	const siteOptions = sites
		.filter( ( site ) => ! disabledSiteIds.includes( site.ID ) )
		.map( ( site ) => ( {
			value: String( site.ID ),
			label: getSiteDisplayName( site ),
		} ) );

	const handleSiteSelect = ( value: string | null | undefined ) => {
		if ( ! value ) {
			return;
		}
		const siteId = Number( value );
		if ( isNaN( siteId ) ) {
			return;
		}
		// Immediately restrict this site.
		mutation.mutate( {
			mcp_abilities: {
				sites: [ { blog_id: siteId, account_tools_enabled: false } ],
			},
		} as any );
	};

	const handleRemoveSite = ( siteId: number ) => {
		// Re-enable AI access for this site.
		mutation.mutate( {
			mcp_abilities: {
				sites: [ { blog_id: siteId, account_tools_enabled: true } ],
			},
		} as any );
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 3 } /> }
					title={ __( 'External AI access exceptions' ) }
					description={ __(
						'External AI access is enabled on all your sites. Add exceptions for specific sites here.'
					) }
				/>
			}
		>
			<VStack spacing={ 6 }>
				<Card>
					<CardBody>
						<VStack spacing={ 4 }>
							<SectionHeader
								level={ 3 }
								title={ __( 'Add an exception' ) }
								description={ __( 'Search for sites to disable external AI access.' ) }
							/>

							<ComboboxControl
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								label={ __( 'Search sites' ) }
								hideLabelFromVision
								value={ null }
								onChange={ handleSiteSelect }
								options={ siteOptions }
								placeholder={ __( 'Search for a site\u2026' ) }
							/>
						</VStack>
					</CardBody>
				</Card>

				{ disabledSites.length > 0 && (
					<VStack spacing={ 4 }>
						<SectionHeader
							level={ 3 }
							title={ __( 'Restricted sites' ) }
							description={ __( 'These sites will not have MCP access.' ) }
						/>
						<ActionList>
							{ disabledSites.map( ( site ) => (
								<ActionList.ActionItem
									key={ site.id }
									title={ site.name }
									description={ site.domain }
									actions={
										<Button
											variant="secondary"
											size="compact"
											disabled={ mutation.isPending }
											onClick={ () => handleRemoveSite( site.id ) }
										>
											{ __( 'Remove' ) }
										</Button>
									}
								/>
							) ) }
						</ActionList>
					</VStack>
				) }
			</VStack>
		</PageLayout>
	);
}
