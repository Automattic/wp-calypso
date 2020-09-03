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

	const featuredProviders = [
		{ id: 'bluehost', name: 'Bluehost', path: settingsCredentialsPath( siteSlug, 'bluehost' ) },
		{
			id: 'siteground',
			name: 'SiteGround',
			path: settingsCredentialsPath( siteSlug, 'siteground' ),
		},
		{ id: 'amazon', name: 'Amazon / AWS', path: settingsCredentialsPath( siteSlug, 'amazon' ) },
		{ id: 'dreamhost', name: 'Dreamhost', path: settingsCredentialsPath( siteSlug, 'dreamhost' ) },
		{ id: 'godaddy', name: 'GoDaddy', path: settingsCredentialsPath( siteSlug, 'godaddy' ) },
		{ id: 'hostgator', name: 'HostGator', path: settingsCredentialsPath( siteSlug, 'hostgator' ) },
		{
			id: 'unknown',
			name: translate( 'I don’t know / my host is not listed here / I have my server credentials' ),
			path: settingsCredentialsPath( siteSlug, 'unknown' ),
		},
	];

	const {
		state: providerGuessState,
		data: { guess } = { guess: 'unknown' },
		error: providerGuessError,
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
				<h3>{ translate( 'Select your website host for example.com' ) }</h3>
				<p>{ translate( 'It looks like your host is SiteGround' ) }</p>
			</Card>
			<VerticalNav>
				{ featuredProviders.map( ( { id, name, path } ) => (
					<VerticalNavItem key={ id } path={ path }>
						{ name }
					</VerticalNavItem>
				) ) }
			</VerticalNav>
		</>
	);
};

export default HostSelection;
