import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { Button, Card } from '@automattic/components';
import styled from '@emotion/styled';
import { ToggleControl } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import InlineSupportLink from 'calypso/components/inline-support-link';
import MaterialIcon from 'calypso/components/material-icon';
import { clearWordPressCache } from 'calypso/state/hosting/actions';
import getRequest from 'calypso/state/selectors/get-request';
import { shouldRateLimitAtomicCacheClear } from 'calypso/state/selectors/should-rate-limit-atomic-cache-clear';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
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
	siteId,
	translate,
} ) => {
	const dispatch = useDispatch();
	const showEdgeCache = config.isEnabled( 'yolo/edge-cache-i1' );
	const {
		isLoading: getEdgeCacheLoading,
		data: isEdgeCacheActive,
		isInitialLoading: getEdgeCacheInitialLoading,
	} = useEdgeCacheQuery( siteId, {
		enabled: showEdgeCache,
	} );

	const { toggleEdgeCache, isLoading: toggleEdgeCacheLoading } = useToggleEdgeCacheMutation(
		siteId,
		{
			onSettled: ( ...args ) => {
				const active = args[ 2 ];
				dispatch(
					recordTracksEvent(
						active
							? 'calypso_hosting_configuration_edge_cache_enable'
							: 'calypso_hosting_configuration_edge_cache_disable',
						{
							site_id: siteId,
						}
					)
				);
			},
		}
	);
	const { clearEdgeCache, isLoading: clearEdgeCacheLoading } = useClearEdgeCacheMutation( siteId, {
		onSuccess: () => {
			dispatch(
				recordTracksEvent( 'calypso_hosting_configuration_clear_wordpress_cache', {
					site_id: siteId,
				} )
			);
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
						'Be careful, clearing the cache may make your site less responsive while it is being rebuilt.'
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
				{ showEdgeCache && (
					<>
						<ToggleContainer>
							{ getEdgeCacheInitialLoading ? (
								<EdgeCacheLoadingPlaceholder />
							) : (
								<>
									<ToggleLabel>{ translate( 'Edge cache' ) }</ToggleLabel>
									<ToggleControl
										disabled={ clearEdgeCacheLoading || getEdgeCacheLoading }
										checked={ isEdgeCacheActive }
										onChange={ toggleEdgeCache }
										label={ translate( 'Enable edge caching for faster content delivery' ) }
									/>
									<Hr />
								</>
							) }
						</ToggleContainer>
					</>
				) }
				{ getClearCacheContent() }
			</CardBody>
		</Card>
	);
};

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			shouldRateLimitCacheClear: shouldRateLimitAtomicCacheClear( state, siteId ),
			isClearingWordpressCache:
				getRequest( state, clearWordPressCache( siteId ) )?.isLoading ?? false,
			siteId,
		};
	},
	{
		clearAtomicWordPressCache: clearWordPressCache,
	}
)( localize( CacheCard ) );
