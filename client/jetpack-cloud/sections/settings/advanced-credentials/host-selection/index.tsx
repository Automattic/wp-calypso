/**
 * External dependencies
 */
import { useDispatch, useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent, useEffect, useMemo } from 'react';
import type { AnyAction } from 'redux';

/**
 * Internal dependencies
 */
import { getHttpData, requestHttpData, DataState } from 'calypso/state/data-layer/http-data';
import { getProviderNameFromId, topHosts, otherHosts } from '../host-info';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { settingsPath } from 'calypso/lib/jetpack/paths';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import Badge from 'calypso/components/badge';
import Gridicon from 'calypso/components/gridicon';
import type { SiteId } from 'calypso/types';

/**
 * Style dependencies
 */
import './style.scss';

function getRequestHostingProviderGuessId( siteId: SiteId ) {
	return `site-hosting-provider-guess-${ siteId }`;
}

function requestHostingProviderGuess( siteId: SiteId ) {
	const requestId = getRequestHostingProviderGuessId( siteId );
	return requestHttpData(
		requestId,
		http( {
			method: 'GET',
			path: `/sites/${ siteId }/hosting-provider`,
			apiNamespace: 'wpcom/v2',
		} ) as AnyAction,
		{
			fromApi: () => ( { guess } ) => [ [ requestId, guess ] ],
		}
	);
}

const HostSelection: FunctionComponent = () => {
	const isMobile = useMobileBreakpoint();
	const siteId = useSelector( getSelectedSiteId ) as SiteId;
	const siteSlug = useSelector( getSelectedSiteSlug );
	const translate = useTranslate();
	const dispatch = useDispatch();

	const {
		state: providerGuessState,
		data: guess = null,
		// error: providerGuessError,
	} = useSelector( () => getHttpData( getRequestHostingProviderGuessId( siteId ) ) );

	const loadingProviderGuess = ! [ DataState.Success, DataState.Failure ].includes(
		providerGuessState
	);

	const providerGuessName = getProviderNameFromId( guess );

	const hostsToShow = useMemo( () => {
		for ( const host of otherHosts ) {
			if ( guess === host.id ) {
				return [ host, ...topHosts ];
			}
		}
		return topHosts;
	}, [ guess ] );

	const recordHostSelectionEvent = ( host: string ) => {
		dispatch(
			recordTracksEvent( 'jetpack_advanced_credentials_flow_host_select', {
				host,
			} )
		);
	};

	useEffect( () => {
		requestHostingProviderGuess( siteId as SiteId );
	}, [ siteId ] );

	return (
		<div className="host-selection">
			<div className="host-selection__header">
				<div className="host-selection__notice">
					{ translate(
						'In order to restore your site, should something go wrong, you’ll need to provide your website’s {{strong}}SSH{{/strong}}, {{strong}}SFTP{{/strong}} or {{strong}}FTP{{/strong}} server credentials. We’ll guide you through it:',
						{
							components: { strong: <strong /> },
						}
					) }
				</div>
				<h3>
					{ translate( 'Select your website host for %(siteSlug)s', {
						args: {
							siteSlug,
						},
					} ) }
				</h3>
				{ providerGuessName && (
					<p>
						{ translate( 'It looks like your host may be %(providerGuessName)s', {
							args: { providerGuessName },
						} ) }
					</p>
				) }
			</div>
			<div className="host-selection__list">
				{ hostsToShow.map( ( { id, name } ) => (
					<a
						className={
							loadingProviderGuess
								? 'host-selection__list-item-placeholder'
								: 'host-selection__list-item'
						}
						key={ id }
						href={ `${ settingsPath( siteSlug ) }?host=${ id }` }
						onClick={ () => recordHostSelectionEvent( id ) }
					>
						<span>{ name }</span>
						<div className="host-selection__list-item-badge-and-icon">
							{ guess === id && (
								<Badge>
									{ isMobile
										? translate( 'Our guess' )
										: translate( 'If we had to guess your host, this would be it' ) }
								</Badge>
							) }
							<Gridicon icon="chevron-right" />
						</div>
					</a>
				) ) }
				<a
					className={
						loadingProviderGuess
							? 'host-selection__list-item-placeholder'
							: 'host-selection__list-item'
					}
					key={ 'generic' }
					href={ `${ settingsPath( siteSlug ) }?host=generic` }
					onClick={ () => recordHostSelectionEvent( 'generic' ) }
				>
					{ isMobile
						? translate( 'My host is not listed here' )
						: translate(
								'I don’t know / my host is not listed here / I have my server credentials'
						  ) }
					<Gridicon icon="chevron-right" />
				</a>
			</div>
		</div>
	);
};

export default HostSelection;
