/**
 * @vitest-environment jsdom
 */
import { HostingFeatures } from '@automattic/api-core';
import { screen } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../../../test-utils';
import ScanCard from '../index';
import type { Site, Threat } from '@automattic/api-core';

const site = {
	ID: 123,
	plan: { features: { active: [ HostingFeatures.SCAN_SELF_SERVE ] } },
} as unknown as Site;

const fixableThreat = { fixable: { fixer: 'update' } } as unknown as Threat;
const nonFixableThreat = {} as Threat;

function mockScan( threats: Threat[] ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/wpcom/v2/sites/${ site.ID }/scan` )
		.reply( 200, {
			threats,
		} );
}

describe( '<ScanCard>', () => {
	test( 'shows that no risks were found when there are no threats', async () => {
		mockScan( [] );

		render( <ScanCard site={ site } /> );

		expect( await screen.findByRole( 'heading', { name: 'No risks found' } ) ).toBeVisible();
	} );

	test( 'shows that auto fixes are available when a threat is fixable', async () => {
		mockScan( [ fixableThreat ] );

		render( <ScanCard site={ site } /> );

		expect( await screen.findByRole( 'heading', { name: '1 risk found' } ) ).toBeVisible();
		expect( screen.getByText( 'Auto fixes are available.' ) ).toBeVisible();
	} );

	test( 'shows that a manual review is required when no threat is fixable', async () => {
		mockScan( [ nonFixableThreat ] );

		render( <ScanCard site={ site } /> );

		expect( await screen.findByRole( 'heading', { name: '1 risk found' } ) ).toBeVisible();
		expect( screen.getByText( 'Manual review required.' ) ).toBeVisible();
	} );

	test( 'shows that auto fixes are available when one of several threats is fixable', async () => {
		mockScan( [ nonFixableThreat, fixableThreat ] );

		render( <ScanCard site={ site } /> );

		expect( await screen.findByRole( 'heading', { name: '2 risks found' } ) ).toBeVisible();
		expect( screen.getByText( 'Auto fixes are available.' ) ).toBeVisible();
	} );
} );
