/**
 * External dependencies
 */
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent, useEffect, useState } from 'react';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import { getHttpData, DataState } from 'state/data-layer/http-data';
import { getRequestHosingProviderGuessId, requestHosingProviderGuess } from 'state/data-getters';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { settingsCredentialsPath } from 'lib/jetpack/paths';
import Badge from 'components/badge';
import StepProgress from 'components/step-progress';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';

/**
 * Internal dependencies
 */
import './style.scss';

const HostSelection: FunctionComponent = () => {
	const translate = useTranslate();
	const [ step ] = useState( 0 );

	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );

	const steps = [
		translate( 'Host locator' ).toString(),
		translate( 'Credentials' ).toString(),
		translate( 'Verification' ).toString(),
	];

	// TODO: move to utils, check host "ids"
	const featuredProviders = [
		{ id: 'bluehost', name: 'Bluehost' },
		{
			id: 'siteground',
			name: 'SiteGround',
		},
		{ id: 'amazon', name: 'Amazon / AWS' },
		{ id: 'dreamhost', name: 'Dreamhost' },
		{ id: 'godaddy', name: 'GoDaddy' },
		{ id: 'hostgator', name: 'HostGator' },
		{
			id: 'unknown',
			name: translate( 'I don’t know / my host is not listed here / I have my server credentials' ),
		},
		{
			id: 'pressable',
			name: 'Pressable',
		},
	];

	const {
		state: providerGuessState,
		data: { guess } = { guess: null },
		// error: providerGuessError,
	} = useSelector( () => getHttpData( getRequestHosingProviderGuessId( siteId ) ) );

	const loadingProviderGuess = ! [ DataState.Success, DataState.Failure ].includes(
		providerGuessState
	);

	useEffect( () => {
		requestHosingProviderGuess( siteId );
	}, [ siteId ] );

	return (
		<>
			<Card>
				<StepProgress currentStep={ step } steps={ steps } />
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
				<p>{ translate( 'It looks like your host is SiteGround' ) }</p>
			</Card>
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
			</VerticalNav>
		</>
	);
};

export default HostSelection;
