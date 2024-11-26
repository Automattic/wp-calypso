import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { ToggleControl, Tooltip } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import React, { useEffect, useState } from 'react';
import { HostingCard, HostingCardDescription } from 'calypso/components/hosting-card';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { PanelDescription, PanelHeading, PanelSection } from 'calypso/components/panel';
import {
	useEdgeCacheQuery,
	useSetEdgeCacheMutation,
	useClearEdgeCacheMutation,
} from 'calypso/data/hosting/use-cache';
import { useDispatch, useSelector } from 'calypso/state';
import { clearEdgeCacheSuccess, clearWordPressCache } from 'calypso/state/hosting/actions';
import getRequest from 'calypso/state/selectors/get-request';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import isSiteComingSoon from 'calypso/state/selectors/is-site-coming-soon';
import { shouldRateLimitAtomicCacheClear } from 'calypso/state/selectors/should-rate-limit-atomic-cache-clear';
import { shouldRateLimitEdgeCacheClear } from 'calypso/state/selectors/should-rate-limit-edge-cache-clear';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { EdgeCacheLoadingPlaceholder } from './edge-cache-loading-placeholder';

import './form.scss';

type CachingFormProps = {
	disabled?: boolean;
};

export default function CachingForm( { disabled }: CachingFormProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );

	const isPrivate = useSelector( ( state ) => isPrivateSite( state, siteId ) );
	const isComingSoon = useSelector( ( state ) => isSiteComingSoon( state, siteId ) );
	const isEdgeCacheEligible = ! isPrivate && ! isComingSoon;

	const [ isClearingAllCaches, setIsClearingAllCaches ] = useState( false );
	const isClearingObjectCache = useSelector( ( state ) => {
		const request = getRequest( state, clearWordPressCache( siteId ) );
		return request?.isLoading ?? false;
	} );
	const isObjectCacheClearRateLimited = useSelector( ( state ) =>
		shouldRateLimitAtomicCacheClear( state, siteId )
	);
	const isEdgeCacheClearRateLimited = useSelector( ( state ) =>
		shouldRateLimitEdgeCacheClear( state, siteId )
	);
	const areAllCachesClearRateLimited = config.isEnabled( 'hosting-server-settings-enhancements' )
		? isObjectCacheClearRateLimited && isEdgeCacheClearRateLimited
		: isObjectCacheClearRateLimited;

	const {
		isLoading: isEdgeCacheLoading,
		data: isEdgeCacheActive,
		isInitialLoading: isEdgeCacheInitialLoading,
	} = useEdgeCacheQuery( siteId );

	const { setEdgeCache } = useSetEdgeCacheMutation();
	const { mutate: clearEdgeCache, isPending: isClearingEdgeCache } = useClearEdgeCacheMutation(
		siteId,
		{
			onSuccess() {
				dispatch( clearEdgeCacheSuccess( siteId ) );
			},
		}
	);

	useEffect( () => {
		if ( isClearingAllCaches && ! isClearingObjectCache && ! isClearingEdgeCache ) {
			setIsClearingAllCaches( false );
		}
	}, [ isClearingObjectCache, isClearingEdgeCache, isClearingAllCaches ] );

	const handleClearAllCache = () => {
		recordTracksEvent( 'calypso_hosting_configuration_clear_wordpress_cache', {
			site_id: siteId,
			cache_type: 'all',
		} );

		if ( isEdgeCacheActive && ! isEdgeCacheClearRateLimited ) {
			clearEdgeCache();
		}
		if ( ! isObjectCacheClearRateLimited ) {
			dispatch( clearWordPressCache( siteId, 'Manually clearing again.' ) );
		}
		setIsClearingAllCaches( true );
	};

	const handleClearEdgeCache = () => {
		recordTracksEvent( 'calypso_hosting_configuration_clear_wordpress_cache', {
			site_id: siteId,
			cache_type: 'edge',
		} );

		clearEdgeCache();
	};

	const handleClearObjectCache = () => {
		recordTracksEvent( 'calypso_hosting_configuration_clear_wordpress_cache', {
			site_id: siteId,
			cache_type: 'object',
		} );

		dispatch( clearWordPressCache( siteId, 'Manually clearing again.' ) );
	};

	const edgeCacheToggleDescription = isEdgeCacheEligible
		? translate( 'Enable global edge caching for faster content delivery.' )
		: translate(
				'Global edge cache can only be enabled for public sites. {{a}}Review privacy settings{{/a}}',
				{
					components: {
						a: config.isEnabled( 'untangling/hosting-menu' ) ? (
							<a href={ '/sites/settings/site/' + siteSlug } />
						) : (
							<a href={ '/settings/general/' + siteSlug + '#site-privacy-settings' } />
						),
					},
				}
		  );

	const isUntangled = config.isEnabled( 'untangling/hosting-menu' );

	return (
		<HostingCard
			fallthrough={ isUntangled }
			className="cache-card"
			headingId="cache"
			title={ translate( 'Performance optimization', {
				comment: 'Heading text for a card on the Server Settings page',
				textOnly: true,
			} ) }
		>
			<>
				<HostingCardDescription hide={ isUntangled }>
					{ translate( 'Manage your site’s server-side caching. {{a}}Learn more{{/a}}', {
						components: {
							a: <InlineSupportLink supportContext="hosting-clear-cache" showIcon={ false } />,
						},
					} ) }
				</HostingCardDescription>
			</>
			<PanelSection isBorderless={ ! isUntangled }>
				<PanelHeading asFormLabel={ ! isUntangled }>{ translate( 'All caches' ) }</PanelHeading>
				<PanelDescription>
					{ translate( 'Clearing the cache may temporarily make your site less responsive.' ) }
				</PanelDescription>
				<Tooltip
					placement="top"
					text={
						areAllCachesClearRateLimited
							? translate( 'You cleared all caches recently. Please wait a minute and try again.' )
							: ''
					}
				>
					<div className="cache-card__button-wrapper">
						<Button
							busy={ isClearingAllCaches }
							disabled={
								disabled ||
								areAllCachesClearRateLimited ||
								isClearingObjectCache ||
								isClearingEdgeCache
							}
							onClick={ handleClearAllCache }
						>
							{ config.isEnabled( 'hosting-server-settings-enhancements' )
								? translate( 'Clear all caches' )
								: translate( 'Clear cache' ) }
						</Button>
					</div>
				</Tooltip>
			</PanelSection>

			{ ! isUntangled && <div className="cache-card__hr" /> }

			<PanelSection isBorderless={ ! isUntangled }>
				{ isEdgeCacheInitialLoading ? (
					<EdgeCacheLoadingPlaceholder />
				) : (
					<>
						<PanelHeading asFormLabel={ ! isUntangled }>
							{ translate( 'Global edge cache', {
								comment: 'Edge cache is a type of CDN that stores generated HTML pages',
							} ) }
						</PanelHeading>
						<ToggleControl
							__nextHasNoMarginBottom
							className="cache-card__edge-cache-toggle"
							checked={ isEdgeCacheActive && isEdgeCacheEligible }
							disabled={ isClearingEdgeCache || isEdgeCacheLoading || ! isEdgeCacheEligible }
							onChange={ ( active ) => {
								recordTracksEvent(
									active
										? 'calypso_hosting_configuration_edge_cache_enable'
										: 'calypso_hosting_configuration_edge_cache_disable',
									{
										site_id: siteId,
									}
								);
								setEdgeCache( siteId, active );
							} }
							label={ edgeCacheToggleDescription }
						/>

						{ config.isEnabled( 'hosting-server-settings-enhancements' ) &&
							isEdgeCacheEligible &&
							isEdgeCacheActive && (
								<Tooltip
									placement="top"
									text={
										isEdgeCacheClearRateLimited
											? translate(
													'You cleared the edge cache recently. Please wait a minute and try again.',
													{
														comment: 'Edge cache is a type of CDN that stores generated HTML pages',
														textOnly: true,
													}
											  )
											: ''
									}
								>
									<div className="cache-card__button-wrapper">
										<Button
											busy={ isClearingEdgeCache && ! isClearingAllCaches }
											disabled={
												disabled ||
												isEdgeCacheClearRateLimited ||
												isEdgeCacheLoading ||
												isClearingEdgeCache
											}
											onClick={ handleClearEdgeCache }
										>
											{ translate( 'Clear edge cache', {
												comment: 'Edge cache is a type of CDN that stores generated HTML pages',
											} ) }
										</Button>
									</div>
								</Tooltip>
							) }
					</>
				) }
			</PanelSection>

			{ config.isEnabled( 'hosting-server-settings-enhancements' ) && (
				<PanelSection isBorderless={ ! isUntangled }>
					<PanelHeading asFormLabel={ ! isUntangled }>
						{ translate( 'Object cache', {
							comment: 'Object cache stores database lookups and some network requests',
						} ) }
					</PanelHeading>
					<PanelDescription>
						{ translate(
							'Data is cached using Memcached to reduce database lookups. {{a}}Learn more{{/a}}',
							{
								comment: 'Explanation for how object cache works',
								components: {
									a: <InlineSupportLink supportContext="hosting-clear-cache" showIcon={ false } />,
								},
							}
						) }
					</PanelDescription>

					<Tooltip
						placement="top"
						text={
							isObjectCacheClearRateLimited
								? translate(
										'You cleared the object cache recently. Please wait a minute and try again.'
								  )
								: ''
						}
					>
						<div className="cache-card__button-wrapper">
							<Button
								busy={ isClearingObjectCache && ! isClearingAllCaches }
								disabled={ disabled || isObjectCacheClearRateLimited || isClearingObjectCache }
								onClick={ handleClearObjectCache }
							>
								{ translate( 'Clear object cache', {
									comment: 'Object cache stores database lookups and some network requests',
								} ) }
							</Button>
						</div>
					</Tooltip>
				</PanelSection>
			) }
		</HostingCard>
	);
}
