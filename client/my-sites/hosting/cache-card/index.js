import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, Card } from '@automattic/components';
import styled from '@emotion/styled';
import { ToggleControl } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import InlineSupportLink from 'calypso/components/inline-support-link';
import MaterialIcon from 'calypso/components/material-icon';
import { clearWordPressCache } from 'calypso/state/hosting/actions';
import getRequest from 'calypso/state/selectors/get-request';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import isSiteComingSoon from 'calypso/state/selectors/is-site-coming-soon';
import { shouldRateLimitAtomicCacheClear } from 'calypso/state/selectors/should-rate-limit-atomic-cache-clear';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { EdgeCacheLoadingPlaceholder } from './edge-cache-loading-placeholder';
import { useClearEdgeCacheMutation } from './use-clear-edge-cache';
import { useEdgeCacheQuery } from './use-edge-cache';
import { useToggleEdgeCacheMutation } from './use-toggle-edge-cache';

const Hr = styled.hr( {
	marginBottom: '16px',
	marginTop: '16px',
	width: '100%',
	color: '#e0e0e0',
} );

const EdgeCacheDescription = styled.p( {
	fontSize: '16px',
	marginBottom: '16px',
} );

const EdgeCacheNotice = styled.p( {
	fontSize: '14px',
	fontStyle: 'italic',
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

	const { toggleEdgeCache, isLoading: toggleEdgeCacheLoading } = useToggleEdgeCacheMutation(
		siteId,
		{
			onSettled: ( ...args ) => {
				const active = args[ 2 ];
				recordTracksEvent(
					active
						? 'calypso_hosting_configuration_edge_cache_enable'
						: 'calypso_hosting_configuration_edge_cache_disable',
					{
						site_id: siteId,
					}
				);
			},
		}
	);
	const { clearEdgeCache, isLoading: clearEdgeCacheLoading } = useClearEdgeCacheMutation( siteId, {
		onSuccess: () => {
			recordTracksEvent( 'calypso_hosting_configuration_clear_wordpress_cache', {
				site_id: siteId,
			} );
		},
	} );

	const isClearingCache = isClearingWordpressCache || clearEdgeCacheLoading;

	const clearCache = () => {
		if ( isEdgeCacheActive ) {
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
						toggleEdgeCacheLoading
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
		<Card className="cache-card">
			<MaterialIcon icon="autorenew" size={ 32 } />
			<CardHeading id="cache" size={ 20 }>
				{ translate( 'Cache' ) }
			</CardHeading>
			<CardBody>
				<EdgeCacheDescription>
					{ translate( 'Manage your site’s server-side caching. {{a}}Learn more{{/a}}.', {
						components: {
							a: <InlineSupportLink supportContext="hosting-clear-cache" showIcon={ false } />,
						},
					} ) }
				</EdgeCacheDescription>
				<ToggleContainer>
					{ getEdgeCacheInitialLoading ? (
						<EdgeCacheLoadingPlaceholder />
					) : (
						<>
							<ToggleLabel>{ translate( 'Global edge cache' ) }</ToggleLabel>
							<ToggleControl
								disabled={ clearEdgeCacheLoading || getEdgeCacheLoading || ! isEdgeCacheEligible }
								checked={ isEdgeCacheActive }
								onChange={ toggleEdgeCache }
								label={ edgeCacheToggleDescription }
							/>
							<Hr />
						</>
					) }
				</ToggleContainer>
				{ getClearCacheContent() }
			</CardBody>
		</Card>
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
