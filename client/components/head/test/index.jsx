/**
 * @jest-environment jsdom
 */

import fs from 'fs';
import path from 'path';
import { render, screen } from '@testing-library/react';
import Head, { RECOLETA_LANGS } from '../';

describe( 'Head', () => {
	test( 'should render default title', () => {
		render( <Head /> );
		expect( screen.queryByText( 'WordPress.com' ) ).toBeInTheDocument();
	} );

	test( 'should render custom title', () => {
		const title = 'Arbitrary Custom Title';
		render( <Head title={ title } /> );
		expect( screen.queryByText( title ) ).toBeInTheDocument();
	} );

	test( 'RECOLETA_LANGS should match $langs in fonts.scss', () => {
		const fontsScss = fs.readFileSync(
			path.resolve( __dirname, '../../../../packages/typography/styles/fonts.scss' ),
			'utf8'
		);
		const match = fontsScss.match( /\$langs:\s*([\s\S]*?);/ );
		expect( match ).toBeTruthy();
		const scssLangs = match[ 1 ]
			.split( ',' )
			.map( ( lang ) => lang.trim() )
			.filter( Boolean )
			.sort();
		expect( [ ...RECOLETA_LANGS ].sort() ).toEqual( scssLangs );
	} );
} );
