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
import { getSelectedSiteId } from 'state/ui/selectors';
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import StepProgress from 'components/step-progress';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';

/**
 * Internal dependencies
 */
import './style.scss';

const SettingsTopLevel: FunctionComponent = () => {
	const translate = useTranslate();

	const siteId = useSelector( getSelectedSiteId );

	const steps = [
		translate( 'Host locator' ).toString(),
		translate( 'Credentials' ).toString(),
		translate( 'Verification' ).toString(),
	];

	const featuredProviders = [
		{ id: 'bluehost', name: 'Bluehost' },
		{ id: 'siteground', name: 'SiteGround' },
		{ id: 'amazon', name: 'Amazon / AWS' },
		{ id: 'dreamhost', name: 'Dreamhost' },
		{ id: 'godaddy', name: 'GoDaddy' },
		{ id: 'hostgator', name: 'HostGator' },
		{
			id: 'other',
			name: translate( 'I don’t know / my host is not listed here / I have my server credentials' ),
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
		<Main className="top">
			<DocumentHead title={ translate( 'Settings' ) } />
			<SidebarNavigation />
			<Card>
				<StepProgress currentStep={ step } steps={ steps } />
				{ children }
			</Card>
			<VerticalNav>
				{ featuredProviders.map( ( { id, name } ) => (
					<VerticalNavItem>{ name }</VerticalNavItem>
				) ) }
			</VerticalNav>
		</Main>
	);
};

export default SettingsTopLevel;
