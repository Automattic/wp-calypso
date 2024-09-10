/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'calypso/state';
import { BackupLastFailed } from '../status-card/backup-last-failed';

jest.mock( 'i18n-calypso' ); // Mock the useTranslate hook
jest.mock( 'calypso/state' ); // Mock the useDispatch hook

describe( 'BackupLastFailed', () => {
	const renderMessage = () => {
		return render( <BackupLastFailed /> );
	};

	const translateMock = jest.fn( ( singular, plural, options ) => {
		if ( options === undefined ) {
			return singular;
		}

		const translatedText = options.count === 1 ? singular : plural;
		return translatedText;
	} );

	beforeEach( () => {
		jest.clearAllMocks();
		useTranslate.mockImplementation( () => translateMock );
		useDispatch.mockImplementation( () => jest.fn() );
	} );

	test( 'renders message last backup failed', () => {
		const { container } = renderMessage();
		expect( container.textContent ).toBe(
			`We encountered some issues with today's backup, but don't worry! We're using the most recent backup available. {{ExternalLink}}Learn more.{{/ExternalLink}}`
		);
	} );
} );
