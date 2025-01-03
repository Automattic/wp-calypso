/**
 * @jest-environment jsdom
 */
import config, { isEnabled } from '@automattic/calypso-config';
import { render, screen } from '@testing-library/react';
import { DIYOption } from '..';

const isMigrationExperimentEnabled = isEnabled( 'migration-flow/experiment' );
const onClick = jest.fn();

const restoreIsMigrationExperimentEnabled = () => {
	if ( isMigrationExperimentEnabled ) {
		config.enable( 'migration-flow/experiment' );
	} else {
		config.disable( 'migration-flow/experiment' );
	}
};

describe( 'DIYOption', () => {
	afterEach( () => {
		restoreIsMigrationExperimentEnabled();
	} );

	it( 'should render the DIY link', () => {
		config.enable( 'migration-flow/experiment' );

		render( <DIYOption onClick={ onClick } /> );

		expect( screen.queryByText( /I'll do it myself/ ) ).toBeInTheDocument();
	} );
} );
