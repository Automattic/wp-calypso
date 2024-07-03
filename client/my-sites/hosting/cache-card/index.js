import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@automattic/components';
import styled from '@emotion/styled';
import { ToggleControl } from '@wordpress/components';
import { localize } from 'i18n-calypso';
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

const Hr = styled.hr( {
	marginBottom: '16px',
	marginTop: '16px',
	width: '100%',
	color: '#e0e0e0',
} );

const EdgeCacheNotice = styled.p( {
	color: '#646970',
	marginTop: '18px',
} );

const CardBody = styled.div( {
	display: 'flex',
	flexDirection: 'column',
} );

const ToggleContainer = styled.div( {
	fontSize: '14px',
	label: {
		fontSize: '14px',
	},
} );

const ToggleLabel = styled.p( {
	marginBottom: '9px',
	fontWeight: 600,
	fontSize: '14px',
} );

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
} ) => {
	const {
		isLoading: getEdgeCacheLoading,
		data: isEdgeCacheActive,
		isInitialLoading: getEdgeCacheInitialLoading,
	} = useEdgeCacheQuery( siteId );

	const isEdgeCacheEligible = ! isPrivate && ! isComingSoon;

	const { setEdgeCache } = useSetEdgeCacheMutation();
	const isEdgeCacheMutating = useIsSetEdgeCacheMutating( siteId );
	const { clearEdgeCache, isLoading: clearEdgeCacheLoading } = useClearEdgeCacheMutation( siteId );

	const isClearingCache = isClearingWordpressCache || clearEdgeCacheLoading;

	const clearCache = () => {
		if ( isEdgeCacheActive ) {
			recordTracksEvent( 'calypso_hosting_configuration_clear_wordpress_cache', {
				site_id: siteId,
			} );
			clearEdgeCache();
		}
		clearAtomicWordPressCache( siteId, 'Manually clearing again.' );
	};

	const getClearCacheContent = () => {
		return (
			<div>
				<Button
					primary
					onClick={ clearCache }
					busy={ isClearingCache }
					disabled={
						disabled ||
						isClearingCache ||
						shouldRateLimitCacheClear ||
						getEdgeCacheLoading ||
						isEdgeCacheMutating
					}
				>
					<span>{ translate( 'Clear cache' ) }</span>
				</Button>
				<EdgeCacheNotice>
					{ translate(
						'Clearing the cache may temporarily make your site less responsive while the cache refreshes.'
					) }
				</EdgeCacheNotice>
				{ shouldRateLimitCacheClear && (
					<p className="form-setting-explanation">
						{ translate( 'You cleared the cache recently. Please wait a minute and try again.' ) }
					</p>
				) }
			</div>
		);
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

	//autorenew
	return (
		<HostingCard className="cache-card" headingId="cache" title={ translate( 'Cache' ) }>
			<CardBody>
				<HostingCardDescription>
					{ translate( 'Manage your site’s server-side caching. {{a}}Learn more{{/a}}.', {
						components: {
							a: <InlineSupportLink supportContext="hosting-clear-cache" showIcon={ false } />,
						},
					} ) }
				</HostingCardDescription>
				<ToggleContainer>
					{ getEdgeCacheInitialLoading ? (
						<EdgeCacheLoadingPlaceholder />
					) : (
						<>
							<ToggleLabel>{ translate( 'Global edge cache' ) }</ToggleLabel>
							<ToggleControl
								disabled={
									clearEdgeCacheLoading ||
									getEdgeCacheLoading ||
									! isEdgeCacheEligible ||
									isEdgeCacheMutating
								}
								checked={ isEdgeCacheActive }
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
							<Hr />
						</>
					) }
				</ToggleContainer>
				{ getClearCacheContent() }
			</CardBody>
		</HostingCard>
	);
};

export default connect(
	( state ) => {
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
