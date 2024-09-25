import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { ToggleControl, Tooltip } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import React, { useEffect, useState } from 'react';
import { HostingCard, HostingCardDescription } from 'calypso/components/hosting-card';
import InlineSupportLink from 'calypso/components/inline-support-link';
import {
	useEdgeCacheQuery,
	useSetEdgeCacheMutation,
	useClearEdgeCacheMutation,
	clearEdgeCacheSuccessNoticeId,
} from 'calypso/data/hosting/use-cache';
import { useDispatch, useSelector } from 'calypso/state';
import { clearObjectCacheSuccessNoticeId } from 'calypso/state/data-layer/wpcom/sites/hosting/clear-cache';
import { clearWordPressCache } from 'calypso/state/hosting/actions';
import { removeNotice, successNotice } from 'calypso/state/notices/actions';
import getRequest from 'calypso/state/selectors/get-request';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import isSiteComingSoon from 'calypso/state/selectors/is-site-coming-soon';
import { shouldRateLimitAtomicCacheClear } from 'calypso/state/selectors/should-rate-limit-atomic-cache-clear';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { EdgeCacheLoadingPlaceholder } from './edge-cache-loading-placeholder';

import './style.scss';

type CacheCardProps = {
	disabled?: boolean;
};

export default function CacheCard( { disabled }: CacheCardProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const isPrivate = useSelector( ( state ) => isPrivateSite( state, siteId ) );
	const isComingSoon = useSelector( ( state ) => isSiteComingSoon( state, siteId ) );
	const [ isClearingAllCaches, setIsClearingAllCaches ] = useState( false );

	const shouldRateLimitObjectCacheClear = useSelector( ( state ) =>
		shouldRateLimitAtomicCacheClear( state, siteId )
	);
	const isClearingObjectCache = useSelector( ( state ) => {
		const request = getRequest( state, clearWordPressCache( siteId ) );
		return request?.isLoading ?? false;
	} );

	const {
		isLoading: isEdgeCacheLoading,
		data: isEdgeCacheActive,
		isInitialLoading: isEdgeCacheInitialLoading,
	} = useEdgeCacheQuery( siteId );

	const isEdgeCacheEligible = ! isPrivate && ! isComingSoon;

	const { setEdgeCache } = useSetEdgeCacheMutation();
	const { mutate: clearEdgeCache, isPending: isClearingEdgeCache } =
		useClearEdgeCacheMutation( siteId );

	const rateLimitCacheClearTooltip = translate(
		'You cleared the cache recently. Please wait a minute and try again.'
	);

	useEffect( () => {
		if ( isClearingAllCaches && ! isClearingObjectCache && ! isClearingEdgeCache ) {
			setIsClearingAllCaches( false );
			dispatch( removeNotice( clearObjectCacheSuccessNoticeId ) );
			dispatch( removeNotice( clearEdgeCacheSuccessNoticeId ) );
			dispatch(
				successNotice( translate( 'Successfully cleared all caches.' ), {
					duration: 5000,
				} )
			);
		}
	}, [ isClearingObjectCache, isClearingEdgeCache, isClearingAllCaches, dispatch, translate ] );

	const handleClearAllCache = () => {
		recordTracksEvent( 'calypso_hosting_configuration_clear_wordpress_cache', {
			site_id: siteId,
		} );

		if ( isEdgeCacheActive ) {
			clearEdgeCache();
		}
		dispatch( clearWordPressCache( siteId, 'Manually clearing again.' ) );
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
				'Global edge cache can only be enabled for public sites. {{a}}Review privacy settings.{{/a}}',
				{
					components: {
						a: <a href={ '/settings/general/' + siteSlug + '#site-privacy-settings' } />,
					},
				}
		  );

	return (
		<HostingCard
			className="cache-card"
			headingId="cache"
			title={ translate( 'Performance optimization' ) }
		>
			<div className="cache-card__all-cache-block">
				<HostingCardDescription>
					{ translate( 'Manage your site’s server-side caching. {{a}}Learn more{{/a}}.', {
						components: {
							a: <InlineSupportLink supportContext="hosting-clear-cache" showIcon={ false } />,
						},
					} ) }
				</HostingCardDescription>

				<Tooltip
					placement="top"
					text={ shouldRateLimitObjectCacheClear ? rateLimitCacheClearTooltip : '' }
				>
					<div className="cache-card__button-wrapper cache-card__button-wrapper__clear-all">
						<Button
							busy={ isClearingAllCaches }
							disabled={
								disabled ||
								shouldRateLimitObjectCacheClear ||
								isEdgeCacheLoading ||
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

				<div className="cache-card__nb">
					{ translate( 'Clearing the cache may temporarily make your site less responsive.' ) }
				</div>
			</div>

			<div className="cache-card__hr"></div>

			<div className="cache-card__global-edge-cache-block">
				{ isEdgeCacheInitialLoading ? (
					<EdgeCacheLoadingPlaceholder />
				) : (
					<>
						<div className="cache-card__subtitle">{ translate( 'Global edge cache' ) }</div>
						<ToggleControl
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
								<Button
									busy={ isClearingEdgeCache && ! isClearingAllCaches }
									disabled={ disabled || isEdgeCacheLoading || isClearingEdgeCache }
									onClick={ handleClearEdgeCache }
								>
									{ translate( 'Clear edge cache' ) }
								</Button>
							) }
					</>
				) }
			</div>

			{ config.isEnabled( 'hosting-server-settings-enhancements' ) && (
				<div className="cache-card__global-object-cache-block">
					<div className="cache-card__subtitle">{ translate( 'Object cache' ) }</div>
					<HostingCardDescription>
						{ translate(
							'Data is cached using Memcached to reduce database lookups. {{a}}Learn more{{/a}}.',
							{
								components: {
									a: <InlineSupportLink supportContext="hosting-clear-cache" showIcon={ false } />,
								},
							}
						) }
					</HostingCardDescription>

					<Tooltip
						placement="top"
						text={ shouldRateLimitObjectCacheClear ? rateLimitCacheClearTooltip : '' }
					>
						<div className="cache-card__button-wrapper">
							<Button
								busy={ isClearingObjectCache && ! isClearingAllCaches }
								disabled={
									disabled ||
									shouldRateLimitObjectCacheClear ||
									isClearingObjectCache ||
									isClearingEdgeCache
								}
								onClick={ handleClearObjectCache }
							>
								{ translate( 'Clear object cache' ) }
							</Button>
						</div>
					</Tooltip>
				</div>
			) }
		</HostingCard>
	);
}
