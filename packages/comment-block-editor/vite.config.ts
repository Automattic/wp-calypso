import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

// https://vitejs.dev/config/
export default defineConfig( ( { mode } ) => {
	const sharedBuild = {
		rollupOptions: {
			external: [ 'react', 'react-dom' ],
			output: {
				compact: true,
				dir: 'build',
			},
		},
		emptyOutDir: false,
	};

	// Build - AddGutenberg
	if ( 'injector' === mode ) {
		return {
			plugins: [ react() ],
			define: {
				'process.env.NODE_ENV': JSON.stringify( process.env.NODE_ENV ),
			},
			build: {
				...sharedBuild,
				lib: {
					name: 'addGutenberg',
					entry: path.resolve( __dirname, 'src/add-gutenberg.tsx' ),
					fileName: 'injector.min',
					formats: [ 'es' ],
				},
			},
		};
	}

	// Build - CommentBlockEditor
	if ( 'editor' === mode ) {
		return {
			plugins: [ react(), cssInjectedByJsPlugin() ],
			define: {
				'process.env.NODE_ENV': JSON.stringify( process.env.NODE_ENV ),
			},
			build: {
				...sharedBuild,
				lib: {
					entry: path.resolve( __dirname, 'src/comment-block-editor.tsx' ),
					name: 'Editor',
					formats: [ 'es' ],
					fileName: 'editor',
				},
			},
		};
	}
} );
