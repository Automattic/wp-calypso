/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { TranslatorInvite } from '../';

describe( 'TranslatorInvite', () => {
	const defaultProps = {
		translate: ( x ) => x,
		localizedLanguageNames: {
			'en-gb': {
				localized: 'British English',
				name: 'English (UK)',
				en: 'British English',
			},
			mt: {
				localized: 'Maltese',
				name: 'Malti',
				en: 'Maltese',
			},
			uk: {
				localized: 'Ukrainian',
				name: 'Українська',
				en: 'Ukrainian',
			},
			tl: {
				localized: 'Filipino',
				name: 'Tagalog',
				en: 'Filipino',
			},
		},
	};

	test( 'should not render when no locale information present', () => {
		const { container } = renderWithProvider( <TranslatorInvite { ...defaultProps } /> );
		expect( container.firstChild ).toBeEmptyDOMElement();
	} );

	test( 'should render when no locale information present', () => {
		renderWithProvider( <TranslatorInvite { ...defaultProps } locale="tl" /> );
		expect(
			screen.getByText(
				'%(languageName)s is only %(percentTranslated)d%% translated. Help translate WordPress into your language.'
			)
		).toBeVisible();
	} );
} );
