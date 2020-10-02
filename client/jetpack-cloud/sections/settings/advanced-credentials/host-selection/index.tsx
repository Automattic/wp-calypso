/**
 * External dependencies
 */
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent, useEffect, useMemo } from 'react';

/**
 * Internal dependencies
 */
import { getHttpData, DataState } from 'state/data-layer/http-data';
import { getProviderNameFromId, topHosts, otherHosts } from '../host-info';
import { getRequestHosingProviderGuessId, requestHosingProviderGuess } from 'state/data-getters';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { settingsPath } from 'lib/jetpack/paths';
import Badge from 'components/badge';
import Gridicon from 'components/gridicon';

/**
 * Style dependencies
 */
import './style.scss';

// interface Props {
// 	onHostChange: ( newHost: string | null ) => void;
// }

// const HostSelection: FunctionComponent< Props > = ( { onHostChange } ) => {
const HostSelection: FunctionComponent = () => {
	const translate = useTranslate();

	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );

	const {
		state: providerGuessState,
		data: { guess } = { guess: null },
		// error: providerGuessError,
	} = useSelector( () => getHttpData( getRequestHosingProviderGuessId( siteId ) ) );

	const loadingProviderGuess = ! [ DataState.Success, DataState.Failure ].includes(
		providerGuessState
	);

	const providerGuessName = getProviderNameFromId( guess );

	const hostsToShow = useMemo( () => {
		const list = [ ...topHosts ];
		for ( const host of otherHosts ) {
			if ( guess === host.id ) {
				list.push( host );
			}
		}
		return list;
	}, [ guess ] );

	useEffect( () => {
		requestHosingProviderGuess( siteId );
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
						{ translate( 'It looks like your host is %(providerGuessName)s', {
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
					>
						<span>{ name }</span>
						<div className="host-selection__list-item-badge-and-icon">
							{ guess === id && (
								<Badge>{ translate( 'If we had to guess your host, this would be it' ) }</Badge>
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
				>
					{ translate(
						'I don’t know / my host is not listed here / I have my server credentials'
					) }
					<Gridicon icon="chevron-right" />
				</a>
			</div>
		</div>
	);
};

export default HostSelection;
