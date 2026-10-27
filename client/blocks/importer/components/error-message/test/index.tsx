/**
 * @jest-environment jsdom
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { render } from '@testing-library/react';
import ErrorMessage from '../index';

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

describe( 'ErrorMessage', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'records the error code, type and file type on mount', () => {
		render(
			<ErrorMessage
				errorData={ { code: 'some_code', type: 'importError' } }
				importerFileType="content"
			/>
		);

		expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_site_importer_start_import_failure',
			{
				error_code: 'some_code',
				error_type: 'importError',
				importer_file_type: 'content',
			}
		);
	} );

	it( 'records the event without a reason when there is no error data', () => {
		render( <ErrorMessage /> );

		expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_site_importer_start_import_failure',
			{
				error_code: undefined,
				error_type: undefined,
				importer_file_type: undefined,
			}
		);
	} );

	it( 'does not record again when re-rendered with equal error data', () => {
		const { rerender } = render(
			<ErrorMessage errorData={ { code: 'some_code', type: 'importError' } } />
		);
		rerender( <ErrorMessage errorData={ { code: 'some_code', type: 'importError' } } /> );

		expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
	} );
} );
