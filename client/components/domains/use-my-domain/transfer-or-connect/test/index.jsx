/**
 * @jest-environment jsdom
 */

import page from '@automattic/calypso-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { domainAvailability } from 'calypso/lib/domains/constants';
import { DomainTransferOrConnect } from '../index';

jest.mock( '@automattic/calypso-router', () => jest.fn() );
jest.mock( 'calypso/components/data/query-products-list', () => () => null );
jest.mock( 'calypso/components/data/query-site-plans', () => () => null );

const SITE = { ID: 123, slug: 'example.wordpress.com' };

const renderCards = ( props = {} ) =>
	render(
		<DomainTransferOrConnect
			availability={ {
				status: domainAvailability.MAPPED_SAME_SITE_NOT_TRANSFERRABLE,
				mappable: 'not_mappable',
			} }
			domain="example.com"
			domainInboundTransferStatusInfo={ {} }
			onTransfer={ jest.fn() }
			recordMappingButtonClickInUseYourDomain={ jest.fn() }
			recordTransferButtonClickInUseYourDomain={ jest.fn() }
			selectedSite={ SITE }
			{ ...props }
		/>
	);

const connectCard = () =>
	screen.getByRole( 'button', { name: /Connect your domain name to this site/ } );

afterEach( () => jest.clearAllMocks() );

test( 'opens the connection setup for a domain already connected to the site', async () => {
	renderCards();

	await userEvent.click( connectCard() );

	expect( page ).toHaveBeenCalledWith( '/domains/mapping/example.wordpress.com/setup/example.com' );
} );

test( 'hands a domain already connected to the site to onConnected when given', async () => {
	const onConnected = jest.fn();
	renderCards( { onConnected } );

	await userEvent.click( connectCard() );

	expect( onConnected ).toHaveBeenCalledWith( { domain: 'example.com', selectedSite: SITE } );
	expect( page ).not.toHaveBeenCalled();
} );
