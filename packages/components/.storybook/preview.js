import './style.scss';

const parameters = {
	controls: {
		sort: 'requiredFirst',
	},
	docs: {
		controls: {
			sort: 'requiredFirst',
		},
	},
	options: {
		storySort: ( a, b ) => {
			// Sort MDX files first
			const isMdxA = a.title.endsWith( '.mdx' );
			const isMdxB = b.title.endsWith( '.mdx' );

			if ( isMdxA && ! isMdxB ) {
				return -1;
			}
			if ( ! isMdxA && isMdxB ) {
				return 1;
			}

			// Fall back to alphabetical order
			return a.title.localeCompare( b.title, { numeric: true } );
		},
	},
};

export default {
	parameters,
};
