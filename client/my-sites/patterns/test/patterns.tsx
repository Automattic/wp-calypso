import { renderToString } from 'react-dom/server';
import Patterns from '../patterns';

describe( 'Patterns', () => {
	test( 'renders server-side correctly', () => {
		expect( renderToString( <Patterns /> ) ).toMatchSnapshot();
	} );
} );
