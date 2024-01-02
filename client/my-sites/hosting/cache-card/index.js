import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, Card } from '@automattic/components';
import styled from '@emotion/styled';
import { ToggleControl } from '@wordpress/components';
import { Icon, reusableBlock as cacheIcon } from '@wordpress/icons';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import InlineSupportLink from 'calypso/components/inline-support-link';
import {
	EDGE_CACHE_ENABLE_DISABLE_NOTICE_ID,
	useEdgeCacheQuery,
	useSetEdgeCacheMutation,
	useClearEdgeCacheMutation,
} from 'calypso/data/hosting/use-cache';
import { useDispatch } from 'calypso/state';
import { clearWordPressCache } from 'calypso/state/hosting/actions';
import { createNotice } from 'calypso/state/notices/actions';
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

	const dispatch = useDispatch();

	const isEdgeCacheEligible = ! isPrivate && ! isComingSoon;

	const { setEdgeCache, isLoading: toggleEdgeCacheLoading } = useSetEdgeCacheMutation( siteId, {
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
			dispatch(
				createNotice(
					'is-success',
					active ? translate( 'Edge cache enabled.' ) : translate( 'Edge cache disabled.' ),
					{ duration: 5000, id: EDGE_CACHE_ENABLE_DISABLE_NOTICE_ID }
				)
			);
		},
	} );
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
			<Icon className="card-icon" icon={ cacheIcon } size={ 32 } />
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
								onChange={ ( active ) => {
									dispatch(
										createNotice(
											'is-plain',
											active
												? translate( 'Enabling edge cache…' )
												: translate( 'Disabling edge cache…' ),
											{ duration: 5000, id: EDGE_CACHE_ENABLE_DISABLE_NOTICE_ID }
										)
									);
									setEdgeCache( active );
								} }
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
