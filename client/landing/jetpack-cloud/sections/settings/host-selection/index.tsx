/**
 * External dependencies
 */
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent, useEffect } from 'react';

/**
 * Internal dependencies
 */

import { featuredProviders, getProviderNameFromId } from '../utils';
import { getHttpData, DataState } from 'state/data-layer/http-data';
import { getRequestHosingProviderGuessId, requestHosingProviderGuess } from 'state/data-getters';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { settingsCredentialsPath } from 'lib/jetpack/paths';
import Badge from 'components/badge';

import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';

/**
 * Internal dependencies
 */
import './style.scss';

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

	useEffect( () => {
		requestHosingProviderGuess( siteId );
	}, [ siteId ] );

	return (
		<>
			<div className="host-selection__notice">
				{ translate(
					'In order to restore your site, should something go wrong, you’ll need to provide your websites {{strong}}SSH{{/strong}}, {{strong}}SFTP{{/strong}} or {{strong}}FTP{{/strong}} server credentials. We’ll guide you through it:',
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

			<VerticalNav>
				{ featuredProviders.map( ( { id, name } ) => (
					<VerticalNavItem
						isPlaceholder={ loadingProviderGuess }
						key={ id }
						path={ settingsCredentialsPath( siteSlug, id ) }
					>
						<div className="host-selection__host-guess-badge">
							{ name }
							{ guess === id && (
								<Badge>{ translate( 'If we had to guess your host, this would be it' ) }</Badge>
							) }
						</div>
					</VerticalNavItem>
				) ) }
				<VerticalNavItem
					isPlaceholder={ loadingProviderGuess }
					key={ 'unknown' }
					path={ settingsCredentialsPath( siteSlug, 'unknown' ) }
				>
					{ translate(
						'I don’t know / my host is not listed here / I have my server credentials'
					) }
				</VerticalNavItem>
			</VerticalNav>
		</>
	);
};

export default HostSelection;
