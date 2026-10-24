const { transformSync } = require( '@babel/core' );

const transform = ( code, filename ) =>
	transformSync( code, {
		filename,
		configFile: false,
		babelrc: false,
		presets: [ [ require.resolve( '../presets/default' ), {} ] ],
	} ).code;

describe( 'default preset', () => {
	// Fails if JSX parsing reaches .ts files (Babel 8 no longer turns it off there), or if .ts files
	// stop getting React's pure annotations.
	test( 'compiles .ts angle-bracket syntax as TypeScript and keeps React pure annotations', () => {
		const code = transform(
			`import { createContext } from 'react';
			export const id = <T>( x: T ) => x;
			export const n = <number>value;
			export const Context = createContext( null );`,
			'file.ts'
		);
		expect( code ).toContain( '/*#__PURE__*/' );
	} );

	// Fails if .tsx files lose JSX or the Emotion plugin, whose targets component selectors need.
	test( 'compiles JSX and Emotion in .tsx files', () => {
		const code = transform(
			`import styled from '@emotion/styled';
			const Title = styled.h1\`color: red;\`;
			export const App = () => <Title>Hi</Title>;`,
			'file.tsx'
		);
		expect( code ).toContain( 'react/jsx-runtime' );
		expect( code ).toMatch( /target: "e[a-z0-9]+0"/ );
	} );
} );
