/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import JetpackConnectSiteUrlInput from '../site-url-input';

const requiredProps = { translate: ( string ) => string };

describe( 'JetpackConnectSiteUrlInput', () => {
	test( 'Should render error when the error type is "notExists" and the site info is fetched', () => {
		const { container } = render(
			<JetpackConnectSiteUrlInput { ...requiredProps } isError="notExists" isFetched />
		);
		expect( container ).toHaveTextContent( 'Invalid site address. Enter a valid WordPress URL.' );
	} );

	test( 'Should not render error when the error type is "notExists" and the site info is not fetched', () => {
		const { container } = render(
			<JetpackConnectSiteUrlInput { ...requiredProps } isError="notExists" />
		);
		expect( container ).not.toHaveTextContent(
			'Invalid site address. Enter a valid WordPress URL.'
		);
	} );
} );
