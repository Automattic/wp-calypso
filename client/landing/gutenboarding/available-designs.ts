const availableDesigns: Readonly< AvailableDesigns > = {
	featured: [
		{
			title: 'Vesta',
			slug: 'vesta',
			template: 'mayland2',
			theme: 'mayland',
			src: 'https://public-api.wordpress.com/rest/v1/template/demo/mayland/mayland2/',
			fonts: {
				headings: 'Cabin',
				base: 'Raleway',
			},
			categories: [ 'featured', 'portfolio' ],
		},
		{
			title: 'Reynolds',
			slug: 'reynolds',
			template: 'rockfield2',
			theme: 'rockfield',
			src: 'https://public-api.wordpress.com/rest/v1/template/demo/rockfield/rockfield2/',
			fonts: {
				headings: 'Playfair Display',
				base: 'Fira Sans',
			},
			categories: [ 'featured', 'portfolio' ],
		},
		{
			title: 'Easley',
			slug: 'easley',
			template: 'maywood',
			theme: 'maywood',
			src: 'https://public-api.wordpress.com/rest/v1/template/demo/maywood/maywood/',
			fonts: {
				headings: 'Space Mono',
				base: 'Roboto',
			},
			categories: [ 'featured', 'portfolio' ],
		},
		{
			title: 'Camden',
			slug: 'Camden',
			template: 'maywood2',
			theme: 'maywood',
			src: 'https://public-api.wordpress.com/rest/v1/template/demo/maywood/maywood2/',
			fonts: {
				headings: 'Space Mono',
				base: 'Roboto',
			},
			categories: [ 'featured', 'portfolio' ],
		},
		{
			title: 'Bowen',
			slug: 'bowen',
			template: 'bowen',
			theme: 'coutoire',
			src: 'https://public-api.wordpress.com/rest/v1/template/demo/coutoire/bowen/',
			fonts: {
				headings: 'Playfair Display',
				base: 'Fira Sans',
			},
			categories: [ 'featured', 'blog' ],
		},
		{
			title: 'Edison',
			slug: 'edison',
			template: 'stratford2',
			theme: 'stratford',
			src: 'https://public-api.wordpress.com/rest/v1/template/demo/stratford/stratford2/',
			fonts: {
				headings: 'Chivo',
				base: 'Open Sans',
			},
			categories: [ 'featured', 'blog' ],
		},
		{
			title: 'Cassel',
			slug: 'cassel',
			template: 'mayland',
			theme: 'mayland',
			src: 'https://public-api.wordpress.com/rest/v1/template/demo/mayland/mayland/',
			fonts: {
				headings: 'Playfair Display',
				base: 'Fira Sans',
			},
			categories: [ 'featured', 'blog' ],
		},
		{
			title: 'Overton',
			slug: 'overton',
			template: 'alves',
			theme: 'alves',
			src: 'https://public-api.wordpress.com/rest/v1/template/demo/alves/alves/',
			fonts: {
				headings: 'Cabin',
				base: 'Raleway',
			},
			categories: [ 'featured', 'business' ],
		},
		{
			title: 'Doyle',
			slug: 'doyle',
			template: 'alves2',
			theme: 'alves',
			src: 'https://public-api.wordpress.com/rest/v1/template/demo/alves/alves2/',
			fonts: {
				headings: 'Playfair Display',
				base: 'Fira Sans',
			},
			categories: [ 'featured', 'business' ],
		},
	],
};

export default availableDesigns;
interface AvailableDesigns {
	featured: Array< import('./stores/onboard/types').Design >;
}
