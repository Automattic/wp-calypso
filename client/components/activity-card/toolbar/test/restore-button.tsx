/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import RestoreButton from '../actions/restore-button';

jest.mock( 'calypso/state/rewind/selectors/can-restore-site', () => jest.fn( () => true ) );

const hint = 'To restore this backup, confirm that you understand it contains known threats.';

const renderButton = ( props: { restoreDisabledHint?: string; withMenu?: boolean } = {} ) =>
	render(
		<Provider store={ configureStore()( {} ) }>
			<RestoreButton
				siteId={ 1 }
				siteSlug="example.wordpress.com"
				rewindId="1792301539"
				restoreDisabledHint={ props.restoreDisabledHint }
				secondaryActions={ props.withMenu ? [ <span key="download">Download backup</span> ] : [] }
			/>
		</Provider>
	);

describe( 'RestoreButton', () => {
	it.each( [ false, true ] )(
		'links to the restore page when nothing holds it back (split button: %s)',
		( withMenu ) => {
			renderButton( { withMenu } );

			expect( screen.getByRole( 'link', { name: 'Restore to this point' } ) ).toHaveAttribute(
				'href',
				'/backup/example.wordpress.com/restore/1792301539'
			);
		}
	);

	it.each( [ false, true ] )(
		'holds Restore back with the hint as its description (split button: %s)',
		( withMenu ) => {
			renderButton( { restoreDisabledHint: hint, withMenu } );

			const restore = screen.getByRole( 'button', { name: 'Restore to this point' } );
			expect( restore ).toBeDisabled();
			expect( restore ).toHaveAccessibleDescription( hint );
			expect( screen.queryByRole( 'link', { name: 'Restore to this point' } ) ).toBeNull();
		}
	);
} );
