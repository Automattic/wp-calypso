import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MinimizedView } from './MinimizedView';

describe( 'MinimizedView', () => {
	it( 'renders the provided title', () => {
		const html = renderToStaticMarkup(
			<MinimizedView title="Need help?" onClick={ () => {} } />
		);
		expect( html ).toContain( 'Need help?' );
	} );

	it( 'defaults the title to "Ask AI"', () => {
		const html = renderToStaticMarkup(
			<MinimizedView onClick={ () => {} } />
		);
		expect( html ).toContain( 'Ask AI' );
	} );

	it( 'renders both the trigger icon and the trailing chevron', () => {
		const html = renderToStaticMarkup(
			<MinimizedView onClick={ () => {} } />
		);
		const svgCount = ( html.match( /<svg/g ) || [] ).length;
		expect( svgCount ).toBeGreaterThanOrEqual( 2 );
	} );
} );
