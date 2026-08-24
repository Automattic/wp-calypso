import './style.scss';

const parameters = {
	controls: {
		expanded: true,
		sort: 'requiredFirst',
	},
	docs: {
		controls: {
			sort: 'requiredFirst',
		},
	},
	options: {
		storySort: ( a, b ) => {
			const sectionOrder = [ 'UI', 'WordPress Core' ];
			const aIndex = sectionOrder.findIndex( ( prefix ) => a.title.startsWith( prefix ) );
			const bIndex = sectionOrder.findIndex( ( prefix ) => b.title.startsWith( prefix ) );

			// If they're in different sections, sort by section order
			if ( aIndex !== bIndex ) {
				if ( aIndex === -1 ) return 1;
				if ( bIndex === -1 ) return -1;
				return aIndex - bIndex;
			}

			// If they're in the same section, put docs entries first (MDX files or
			// autodocs-generated pages). Storybook 9 no longer auto-pins Docs to the
			// top of each component group, so we need to handle it here.
			// Autodocs entries have type === 'docs' but importPath ending in .stories.*
			const aIsDocs = a.type === 'docs' || a.importPath.endsWith( '.mdx' );
			const bIsDocs = b.type === 'docs' || b.importPath.endsWith( '.mdx' );

			if ( aIsDocs && ! bIsDocs ) return -1;
			if ( ! aIsDocs && bIsDocs ) return 1;

			// If both are MDX or both are not MDX, maintain original order
			return 0;
		},
	},
};

export default {
	parameters,
	tags: [ 'autodocs' ],
};
