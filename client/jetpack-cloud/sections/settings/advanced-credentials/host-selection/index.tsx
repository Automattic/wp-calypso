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
import { getProviderNameFromId, hosts } from '../../utils';
import { getRequestHosingProviderGuessId, requestHosingProviderGuess } from 'state/data-getters';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import Badge from 'components/badge';
import Gridicon from 'components/gridicon';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	onHostChange: ( newHost: string | null ) => void;
}

const HostSelection: FunctionComponent< Props > = ( { onHostChange } ) => {
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
		const list = [];
		for ( const hostId in hosts ) {
			if ( hosts[ hostId ].top || hostId === guess ) {
				list.push( {
					...hosts[ hostId ],
					id: hostId,
				} );
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
					<button
						className={
							loadingProviderGuess
								? 'host-selection__list-item-placeholder'
								: 'host-selection__list-item'
						}
						key={ id }
						onClick={ () => onHostChange( id ) }
					>
						{ /* <div className="host-selection__host-guess-badge"> */ }
						{ name }
						{ guess === id && (
							<Badge>{ translate( 'If we had to guess your host, this would be it' ) }</Badge>
						) }
						{ /* </div> */ }
						<Gridicon icon="chevron-right" />
					</button>
				) ) }
				<button
					className={
						loadingProviderGuess
							? 'host-selection__list-item-placeholder'
							: 'host-selection__list-item'
					}
					key={ 'unknown' }
					onClick={ () => onHostChange( 'unknown' ) }
				>
					{ translate(
						'I don’t know / my host is not listed here / I have my server credentials'
					) }
					<Gridicon icon="chevron-right" />
				</button>
			</div>
		</div>
	);
};

export default HostSelection;
