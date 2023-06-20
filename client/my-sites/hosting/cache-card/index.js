import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { Button, Card } from '@automattic/components';
import styled from '@emotion/styled';
import { ToggleControl } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { localize, useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import InlineSupportLink from 'calypso/components/inline-support-link';
import MaterialIcon from 'calypso/components/material-icon';
import { clearWordPressCache } from 'calypso/state/hosting/actions';
import getRequest from 'calypso/state/selectors/get-request';
import { shouldRateLimitAtomicCacheClear } from 'calypso/state/selectors/should-rate-limit-atomic-cache-clear';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useClearEdgeCacheMutation } from './use-clear-edge-cache';
import { useEdgeCacheQuery } from './use-edge-cache';
import { useToggleEdgeCacheMutation } from './use-toggle-edge-cache';

const CardBody = styled.div( {
	display: 'flex',
	marginLeft: '3em',
	flexDirection: 'column',
} );

const ToggleContainer = styled.div( {
	label: {
		fontSize: '16px',
	},
} );

const EdgeCacheToggle = ( { onEdgeCacheToggle, checked, disabled } ) => {
	const translate = useTranslate();
	return (
		<ToggleContainer>
			<ToggleControl
				disabled={ disabled }
				checked={ checked }
				onChange={ onEdgeCacheToggle }
				label={ translate( 'Edge Cache' ) }
			/>
		</ToggleContainer>
	);
};

export const CacheCard = ( {
	disabled,
	shouldRateLimitCacheClear,
	clearAtomicWordPressCache,
	isClearingWordpressCache,
	siteId,
	translate,
} ) => {
	const dispatch = useDispatch();
	const showEdgeCache = config.isEnabled( 'edge-cache' );
	const [ isEdgeCacheActive, setIsEdgeCacheActive ] = useState( false );
	const { loading: getEdgeCacheLoading, data: edgeCacheActive } = useEdgeCacheQuery( siteId, {
		enabled: showEdgeCache,
	} );
	const { toggleEdgeCache, isLoading: toggleEdgeCacheLoading } = useToggleEdgeCacheMutation(
		siteId,
		{
			onSuccess: ( args ) => {
				const active = args[ 1 ];
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

	useEffect( () => {
		setIsEdgeCacheActive( edgeCacheActive );
	}, [ edgeCacheActive ] );

	const getClearCacheContent = () => {
		return (
			<div>
				<p>
					{ translate(
						'Be careful, clearing the cache may make your site unresponsive while it is being rebuilt. {{a}}Learn more{{/a}}.',
						{
							components: {
								a: <InlineSupportLink supportContext="hosting-clear-cache" showIcon={ false } />,
							},
						}
					) }
				</p>
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
			<CardHeading id="cache">{ translate( 'Cache' ) }</CardHeading>
			{ showEdgeCache ? (
				<CardBody>
					<EdgeCacheToggle
						onEdgeCacheToggle={ ( active ) => {
							toggleEdgeCache( active );
							setIsEdgeCacheActive( active );
						} }
						checked={ isEdgeCacheActive }
						disabled={ clearEdgeCacheLoading }
					/>
					{ getClearCacheContent() }
				</CardBody>
			) : (
				getClearCacheContent()
			) }
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
