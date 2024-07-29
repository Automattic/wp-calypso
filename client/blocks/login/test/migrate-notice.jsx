/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import MigrateNotice from 'calypso/blocks/login/migrate-notice';

describe( 'MigrateNotice', () => {
	const defaultProps = {
		translate: ( string ) => string,
		recordTracksEvent: jest.fn(),
	};

	test( 'displays a migrate notice', () => {
		const { container } = render( <MigrateNotice { ...defaultProps } /> );

		expect( container.getElementsByClassName( 'login__form-migrate-notice' ) ).toHaveLength( 1 );
	} );
} );
