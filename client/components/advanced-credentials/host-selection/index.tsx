import { Gridicon, Badge } from '@automattic/components';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useMemo } from 'react';
import { settingsPath } from 'calypso/lib/jetpack/paths';
import wpcom from 'calypso/lib/wp';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getProviderNameFromId, topHosts, otherHosts } from '../host-info';
import type { SiteId } from 'calypso/types';
import './style.scss';

interface Guess {
	guess: string;
}

function useHostingProviderGuessQuery( siteId: SiteId ) {
	return useQuery( {
		queryKey: [ 'site-hosting-provider-guess', siteId ],
		queryFn: (): Promise< Guess > =>
			wpcom.req.get( {
				path: `/sites/${ siteId }/hosting-provider`,
				apiNamespace: 'wpcom/v2',
			} ),
		enabled: !! siteId,
		meta: { persist: false },
		select: ( data ) => data.guess,
	} );
}

const HostSelection: FunctionComponent = () => {
	const isMobile = useMobileBreakpoint();
	const siteId = useSelector( getSelectedSiteId ) as SiteId;
	const siteSlug = useSelector( getSelectedSiteSlug ) as string;
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { isLoading, data: guess } = useHostingProviderGuessQuery( siteId );
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
			recordTracksEvent( 'calypso_jetpack_advanced_credentials_flow_host_select', {
				host,
			} )
		);
	};

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
							isLoading ? 'host-selection__list-item-placeholder' : 'host-selection__list-item'
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
						isLoading ? 'host-selection__list-item-placeholder' : 'host-selection__list-item'
					}
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
