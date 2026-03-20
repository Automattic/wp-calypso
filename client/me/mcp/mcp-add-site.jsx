import { sitesQuery, userSettingsQuery, userSettingsMutation } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	Button,
	ComboboxControl,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Card,
	CardBody,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import SiteIcon from 'calypso/blocks/site-icon';
import DocumentHead from 'calypso/components/data/document-head';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import ReauthRequired from 'calypso/me/reauth-required';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { SectionHeader } from '../../dashboard/components/section-header';
import { getSiteDisplayName } from '../../dashboard/utils/site-name';
import { getSiteDisplayUrl } from '../../dashboard/utils/site-url';
import { useMcpPageChrome } from './mcp-page-header';
import {
	buildMcpAllowSingleSitePayload,
	getAccountMcpAbilities,
	hasEnabledAccountTools,
} from './utils';

import './style.scss';

export default function McpAddSitePage( { path } ) {
	const translate = useTranslate();
	const { documentTitle, navigationHeaderProps } = useMcpPageChrome();
	const queryClient = useQueryClient();
	const dispatch = useDispatch();

	const { data: sites = [], error: sitesError } = useQuery(
		sitesQuery( 'all', { site_visibility: 'visible', include_a8c_owned: false } )
	);
	const { data: userSettings, error: userSettingsError } = useQuery( userSettingsQuery() );

	const [ selectedSiteId, setSelectedSiteId ] = useState( '' );
	const [ reauthRequired, setReauthRequired ] = useState( false );

	useEffect( () => {
		const checkReauth = () => setReauthRequired( twoStepAuthorization.isReauthRequired() );
		twoStepAuthorization.on( 'change', checkReauth );
		checkReauth();
		return () => twoStepAuthorization.off( 'change', checkReauth );
	}, [] );

	const mutation = useMutation( {
		...userSettingsMutation(),
		onSuccess: ( newData ) => {
			queryClient.setQueryData( userSettingsQuery().queryKey, newData );
			dispatch(
				successNotice( translate( 'MCP is enabled for your account and the site you chose.' ), {
					id: 'mcp-settings-saved',
				} )
			);
			page( '/me/mcp' );
		},
		onError: () => {
			dispatch(
				errorNotice( translate( 'Failed to save MCP settings.' ), { id: 'mcp-settings-error' } )
			);
		},
	} );

	const mcpAbilities = getAccountMcpAbilities( userSettings || {} );
	const hasTools = Object.keys( mcpAbilities ).length > 0;
	const accountMcpOn = hasEnabledAccountTools( userSettings || {} );

	const comboboxOptions = useMemo( () => {
		return sites.map( ( site ) => ( {
			value: String( site.ID ),
			label: getSiteDisplayName( site ),
			site,
		} ) );
	}, [ sites ] );

	const handleApply = () => {
		const blogId = Number( selectedSiteId );
		if ( ! blogId || isNaN( blogId ) ) {
			return;
		}
		const payload = buildMcpAllowSingleSitePayload( userSettings, sites, blogId );
		if ( ! payload ) {
			return;
		}
		mutation.mutate( payload );
	};

	const renderComboboxItem = ( { item } ) => {
		const option = comboboxOptions.find( ( o ) => o.value === item.value );
		if ( ! option?.site ) {
			return item.label;
		}
		return (
			<HStack spacing={ 3 } alignment="left">
				<SiteIcon site={ option.site } size={ 32 } />
				<VStack spacing={ 0 }>
					<Text as="div" weight={ 500 } size={ 14 } lineHeight={ 1.5 } color="inherit">
						{ item.label }
					</Text>
					<Text as="div" size={ 12 } weight={ 400 } lineHeight={ 1.2 } color="inherit">
						{ getSiteDisplayUrl( option.site ) }
					</Text>
				</VStack>
			</HStack>
		);
	};

	if ( userSettingsError || sitesError ) {
		return null;
	}

	if ( ! config.isEnabled( 'mcp-settings' ) ) {
		return null;
	}

	return (
		<Main wideLayout className="mcp mcp-add-site">
			<PageViewTracker path={ path } title="MCP — Add to a site" />
			<DocumentHead title={ documentTitle } />
			<NavigationHeader { ...navigationHeaderProps } />
			<HeaderCake backText={ translate( 'Back' ) } backHref="/me/mcp">
				{ translate( 'Add to a specific site' ) }
			</HeaderCake>
			<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
			{ ! reauthRequired && (
				<VStack spacing={ 6 } alignment="stretch">
					{ ! hasTools && (
						<Text variant="muted" as="p">
							{ translate( 'No MCP tools are available for your account yet.' ) }
						</Text>
					) }

					{ hasTools && accountMcpOn && (
						<Card>
							<CardBody>
								<VStack spacing={ 3 }>
									<Text as="p">
										{ translate(
											'MCP access is already enabled for your account. To choose which sites are excluded, use Site exceptions.'
										) }
									</Text>
									<HStack spacing={ 3 }>
										<Button variant="primary" href="/me/mcp/mcp-sites">
											{ translate( 'Site exceptions' ) }
										</Button>
										<Button variant="secondary" href="/me/mcp">
											{ translate( 'Back to AI and MCP' ) }
										</Button>
									</HStack>
								</VStack>
							</CardBody>
						</Card>
					) }

					{ hasTools && ! accountMcpOn && (
						<Card>
							<CardBody>
								<VStack spacing={ 4 }>
									<SectionHeader
										level={ 3 }
										title={ translate( 'Choose a site' ) }
										description={ translate(
											'Turn on MCP for your account and allow it only on the site you select. Your other sites will be added as exceptions until you change this in Site exceptions.'
										) }
									/>
									{ sites.length === 0 && (
										<Text variant="muted" as="p">
											{ translate( 'You don’t have any visible sites yet.' ) }
										</Text>
									) }
									{ sites.length > 0 && (
										<>
											<ComboboxControl
												__next40pxDefaultSize
												__nextHasNoMarginBottom
												label={ translate( 'Site' ) }
												hideLabelFromVision
												value={ selectedSiteId }
												onChange={ ( value ) => setSelectedSiteId( value || '' ) }
												options={ comboboxOptions.map( ( { value, label } ) => ( {
													value,
													label,
												} ) ) }
												allowReset
												disabled={ mutation.isPending }
												placeholder={ translate( 'Search for a site…' ) }
												__experimentalRenderItem={ renderComboboxItem }
											/>
											<Button
												variant="primary"
												disabled={ mutation.isPending || ! selectedSiteId || sites.length === 0 }
												onClick={ handleApply }
											>
												{ translate( 'Enable MCP for this site' ) }
											</Button>
										</>
									) }
								</VStack>
							</CardBody>
						</Card>
					) }
				</VStack>
			) }
		</Main>
	);
}
