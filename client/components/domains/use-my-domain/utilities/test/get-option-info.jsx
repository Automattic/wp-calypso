/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import moment from 'moment';
import { domainAvailability } from 'calypso/lib/domains/constants';
import { getOptionInfo } from '../get-option-info';

const DOMAIN = 'example.com';
const ELIGIBLE_DATE = '2026-12-01T00:00:00+00:00';

const getCards = ( status, domainInboundTransferStatusInfo ) => {
	const [ transfer, connect ] = getOptionInfo( {
		availability: { status, mappable: 'not_mappable' },
		domain: DOMAIN,
		domainInboundTransferStatusInfo,
		onConnect: jest.fn(),
		onTransfer: jest.fn(),
	} );
	return { transfer, connect };
};

const renderTopText = ( card ) => render( <div>{ card.topText }</div> ).container;

describe( 'getOptionInfo() for a domain already connected to the site', () => {
	const status = domainAvailability.MAPPED_SAME_SITE_TRANSFERRABLE;

	test( 'disables Transfer during the 60-day lock and says when it ends', () => {
		const { transfer, connect } = getCards( status, {
			transferRestrictionStatus: 'initial_registration_period',
			transferEligibleDate: ELIGIBLE_DATE,
		} );

		expect( transfer.onSelect ).toBeUndefined();
		const transferText = renderTopText( transfer );
		expect( transferText ).toHaveTextContent(
			'Domains can’t be transferred for 60 days after they’re registered or transferred.'
		);
		expect( transferText ).toHaveTextContent( moment( ELIGIBLE_DATE ).format( 'LL' ) );
		expect( transferText ).not.toHaveTextContent( /connect/i );

		render( <div>{ connect.topText }</div> );
		expect( screen.getByText( 'This domain is already connected to your site.' ) ).toBeVisible();
	} );

	test( 'disables Transfer during the 60-day lock without a date', () => {
		const { transfer } = getCards( status, {
			transferRestrictionStatus: 'initial_registration_period',
			transferEligibleDate: null,
		} );

		expect( transfer.onSelect ).toBeUndefined();
		expect( renderTopText( transfer ) ).toHaveTextContent(
			`Domains can’t be transferred for 60 days after they’re registered or transferred, so ${ DOMAIN } can’t be transferred yet.`
		);
	} );

	test( 'disables Transfer with the max-term message when the term limit applies', () => {
		const { transfer } = getCards( status, {
			transferRestrictionStatus: 'max_term',
			transferEligibleDate: ELIGIBLE_DATE,
			termMaximumInYears: 10,
		} );

		expect( transfer.onSelect ).toBeUndefined();
		expect( renderTopText( transfer ) ).toHaveTextContent(
			'beyond the maximum allowed term of 10 years'
		);
	} );

	test( 'falls back to the generic message for max term without a date', () => {
		const { transfer } = getCards( status, {
			transferRestrictionStatus: 'max_term',
			transferEligibleDate: null,
		} );

		expect( transfer.onSelect ).toBeUndefined();
		expect( renderTopText( transfer ) ).toHaveTextContent(
			'This domain name cannot be transferred.'
		);
	} );

	test.each( [
		[ 'not restricted', { transferRestrictionStatus: 'not_restricted' } ],
		[
			'not restricted with a registrar lock',
			{ transferRestrictionStatus: 'not_restricted', unlocked: false },
		],
		[ 'missing', undefined ],
		[ 'empty after a failed request', {} ],
		[
			'without any fields',
			{ transferRestrictionStatus: undefined, transferEligibleDate: undefined },
		],
	] )( 'keeps Transfer available when the status is %s', ( _label, info ) => {
		const { transfer, connect } = getCards( status, info );

		expect( transfer.onSelect ).toEqual( expect.any( Function ) );
		render( <div>{ connect.topText }</div> );
		expect(
			screen.getByText(
				'This domain is already connected to your site, but you can still transfer it.'
			)
		).toBeVisible();
	} );
} );

describe( 'getOptionInfo() for other availability statuses', () => {
	test( 'leaves an unconnected transferrable domain unchanged when a restriction is reported', () => {
		const { transfer } = getCards( domainAvailability.TRANSFERRABLE, {
			transferRestrictionStatus: 'initial_registration_period',
			transferEligibleDate: ELIGIBLE_DATE,
		} );

		expect( transfer.onSelect ).toEqual( expect.any( Function ) );
	} );

	test( 'keeps the existing 60-day copy for an unconnected domain', () => {
		const { transfer } = getCards( domainAvailability.RECENT_REGISTRATION_LOCK_NOT_TRANSFERRABLE );

		expect( transfer.onSelect ).toBeUndefined();
		expect( renderTopText( transfer ) ).toHaveTextContent(
			`${ DOMAIN } can't be transferred because it was registered less than 60 days ago, but you can connect it instead.`
		);
	} );
} );
