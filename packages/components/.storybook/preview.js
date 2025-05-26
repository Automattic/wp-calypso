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
			const sectionOrder = [ 'Validated Form Controls', 'WP Overrides', 'Deprecated', 'Unaudited' ];
			const aIndex = sectionOrder.findIndex( ( prefix ) => a.title.startsWith( prefix ) );
			const bIndex = sectionOrder.findIndex( ( prefix ) => b.title.startsWith( prefix ) );

			// If they're in different sections, sort by section order
			if ( aIndex !== bIndex ) {
				if ( aIndex === -1 ) return 1;
				if ( bIndex === -1 ) return -1;
				return aIndex - bIndex;
			}

			// If they're in the same section, put MDX files first
			const aIsMdx = a.importPath.endsWith( '.mdx' );
			const bIsMdx = b.importPath.endsWith( '.mdx' );

			if ( aIsMdx && ! bIsMdx ) return -1;
			if ( ! aIsMdx && bIsMdx ) return 1;

			// If both are MDX or both are not MDX, maintain original order
			return 0;
		},
	},
};

export default {
	parameters,
};
