import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { Button, JetpackLogo } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { localize, LocalizeProps } from 'i18n-calypso';
import { connect } from 'react-redux';
import { HostingCard, HostingCardDescription } from 'calypso/components/hosting-card';
import InlineSupportLink from 'calypso/components/inline-support-link';
import {
	useEdgeCacheQuery,
	useSetEdgeCacheMutation,
	useIsSetEdgeCacheMutating,
	useClearEdgeCacheMutation,
} from 'calypso/data/hosting/use-cache';
import { clearWordPressCache } from 'calypso/state/hosting/actions';
import getRequest from 'calypso/state/selectors/get-request';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import isSiteComingSoon from 'calypso/state/selectors/is-site-coming-soon';
import { shouldRateLimitAtomicCacheClear } from 'calypso/state/selectors/should-rate-limit-atomic-cache-clear';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { EdgeCacheLoadingPlaceholder } from './edge-cache-loading-placeholder';
import type { IAppState } from 'calypso/state/types';

import './style.scss';

type CacheCardProps = {
	disabled: boolean;
	shouldRateLimitCacheClear: boolean;
	clearAtomicWordPressCache: ( siteId: number | null, reason: string ) => void;
	isClearingWordpressCache: boolean;
	isPrivate: boolean | null;
	isComingSoon: boolean;
	siteId: number | null;
	siteSlug: string | null;
	translate: LocalizeProps[ 'translate' ];
};

export const CacheCard = ( {
	disabled,
	shouldRateLimitCacheClear,
	clearAtomicWordPressCache,
	isClearingWordpressCache,
	isPrivate,
	isComingSoon,
	siteId,
	siteSlug,
	translate,
}: CacheCardProps ) => {
	const {
		isLoading: getEdgeCacheLoading,
		data: isEdgeCacheActive,
		isInitialLoading: getEdgeCacheInitialLoading,
	} = useEdgeCacheQuery( siteId );

	const isEdgeCacheEligible = ! isPrivate && ! isComingSoon;

	const { setEdgeCache } = useSetEdgeCacheMutation();
	const isEdgeCacheMutating = useIsSetEdgeCacheMutating( siteId );
	const { clearEdgeCache, isLoading: isClearingEdgeCache } = useClearEdgeCacheMutation( siteId );

	const handleClearAllCache = () => {
		recordTracksEvent( 'calypso_hosting_configuration_clear_wordpress_cache', {
			site_id: siteId,
		} );

		if ( isEdgeCacheActive ) {
			// @ts-expect-error TODO: Fix this
			clearEdgeCache();
		}
		clearAtomicWordPressCache( siteId, 'Manually clearing again.' );
	};

	const handleClearEdgeCache = () => {
		recordTracksEvent( 'calypso_hosting_configuration_clear_wordpress_cache', {
			site_id: siteId,
			cache_type: 'edge',
		} );

		// @ts-expect-error TODO: Fix this
		clearEdgeCache();
	};

	const handleClearObjectCache = () => {
		recordTracksEvent( 'calypso_hosting_configuration_clear_wordpress_cache', {
			site_id: siteId,
			cache_type: 'object',
		} );

		clearAtomicWordPressCache( siteId, 'Manually clearing again.' );
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

	const disableButtons =
		disabled ||
		shouldRateLimitCacheClear ||
		getEdgeCacheLoading ||
		isEdgeCacheMutating ||
		isClearingWordpressCache ||
		isClearingEdgeCache;

	return (
		<HostingCard
			className="cache-card"
			headingId="cache"
			title={ translate( 'Performance optimization' ) }
		>
			<div className="performance-optimization__all-cache-block">
				<HostingCardDescription>
					{ translate( 'Manage your site’s server-side caching. {{a}}Learn more{{/a}}.', {
						components: {
							a: <InlineSupportLink supportContext="hosting-clear-cache" showIcon={ false } />,
						},
					} ) }
				</HostingCardDescription>
				<Button
					onClick={ handleClearAllCache }
					disabled={ disableButtons }
					busy={ isClearingWordpressCache && isClearingEdgeCache }
					className="performance-optimization__button"
				>
					<span>{ translate( 'Clear all caches' ) }</span>
				</Button>
				<div className="performance-optimization__nb">
					{ translate( 'Clearing the cache may temporarily make your site less responsive.' ) }
				</div>
				{ shouldRateLimitCacheClear && (
					<div className="performance-optimization__nb">
						{ translate( 'You cleared the cache recently. Please wait a minute and try again.' ) }
					</div>
				) }
			</div>

			<div className="performance-optimization__hr"></div>

			<div className="performance-optimization__global-edge-cache-block">
				{ getEdgeCacheInitialLoading ? (
					<EdgeCacheLoadingPlaceholder />
				) : (
					<>
						<div className="performance-optimization__subtitle">
							{ translate( 'Global edge cache' ) }
						</div>
						<ToggleControl
							disabled={
								isClearingEdgeCache ||
								getEdgeCacheLoading ||
								! isEdgeCacheEligible ||
								isEdgeCacheMutating
							}
							checked={ isEdgeCacheActive && isEdgeCacheEligible }
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
									disabled={ disableButtons }
									busy={ isClearingEdgeCache }
									onClick={ handleClearEdgeCache }
									className="performance-optimization__button"
								>
									<span>{ translate( 'Clear edge cache' ) }</span>
								</Button>
							) }
					</>
				) }
			</div>

			{ config.isEnabled( 'hosting-server-settings-enhancements' ) && (
				<div className="performance-optimization__global-object-cache-block">
					<div className="performance-optimization__subtitle">{ translate( 'Object cache' ) }</div>
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
					<Button
						disabled={ disableButtons }
						busy={ isClearingWordpressCache }
						onClick={ handleClearObjectCache }
						className="performance-optimization__button"
					>
						<span>{ translate( 'Clear object cache' ) }</span>
					</Button>
				</div>
			) }

			{ config.isEnabled( 'hosting-server-settings-enhancements' ) && (
				<>
					<div className="performance-optimization__hr"></div>

					<div className="performance-optimization__jetpack-block">
						<HostingCardDescription>
							<JetpackLogo size={ 16 } />
							<div>
								{ translate(
									'Jetpack indexes the content of your site with Elasticsearch. {{a}}Learn more{{/a}}.',
									{
										components: {
											a: (
												<InlineSupportLink
													supportContext="hosting-clear-cache"
													showIcon={ false }
												/>
											),
										},
									}
								) }
							</div>
						</HostingCardDescription>
					</div>
				</>
			) }
		</HostingCard>
	);
};

export default connect(
	( state: IAppState ) => {
		const siteId = getSelectedSiteId( state );
		const siteSlug = getSelectedSiteSlug( state );
		const isPrivate = isPrivateSite( state, siteId );
		const isComingSoon = isSiteComingSoon( state, siteId );

		return {
			shouldRateLimitCacheClear: shouldRateLimitAtomicCacheClear( state, siteId ),
			isClearingWordpressCache:
				getRequest( state, clearWordPressCache( siteId ) )?.isLoading ?? false,
			isPrivate,
			isComingSoon,
			siteId,
			siteSlug,
		};
	},
	{
		clearAtomicWordPressCache: clearWordPressCache,
	}
)( localize( CacheCard ) );
