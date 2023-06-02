import componentGenerator from './generators/component.js';
import libraryGenerator from './generators/library.js';

const config = ( plop ) => {
	plop.setGenerator( 'component', componentGenerator );
	plop.setGenerator( 'library', libraryGenerator );
};

export default config;
