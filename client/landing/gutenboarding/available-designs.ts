const availableDesigns: Readonly< AvailableDesigns > = {
	featured: [
		{
			title: 'Vesta',
			slug: 'vesta',
			template: 'vesta',
			theme: 'mayland',
			src: 'https://public-api.wordpress.com/rest/v1/template/demo/mayland/vesta/',
			fonts: {
				headings: 'Cabin',
				base: 'Raleway',
			},
			categories: [ 'featured', 'portfolio' ],
		},
		{
			title: 'Reynolds',
			slug: 'reynolds',
			template: 'reynolds',
			theme: 'rockfield',
			src: 'https://public-api.wordpress.com/rest/v1/template/demo/rockfield/reynolds/',
			fonts: {
				headings: 'Playfair Display',
				base: 'Fira Sans',
			},
			categories: [ 'featured', 'portfolio' ],
		},
		{
			title: 'Easley',
			slug: 'easley',
			template: 'easley',
			theme: 'maywood',
			src: 'https://public-api.wordpress.com/rest/v1/template/demo/maywood/easley/',
			fonts: {
				headings: 'Space Mono',
				base: 'Roboto',
			},
			categories: [ 'featured', 'portfolio' ],
		},
		{
			title: 'Camdem',
			slug: 'Camdem',
			template: 'camdem',
			theme: 'maywood',
			src: 'https://public-api.wordpress.com/rest/v1/template/demo/maywood/camdem/',
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
			template: 'edison',
			theme: 'stratford',
			src: 'https://public-api.wordpress.com/rest/v1/template/demo/stratford/edison/',
			fonts: {
				headings: 'Chivo',
				base: 'Open Sans',
			},
			categories: [ 'featured', 'blog' ],
		},
		{
			title: 'Cassel',
			slug: 'cassel',
			template: 'cassel',
			theme: 'mayland',
			src: 'https://public-api.wordpress.com/rest/v1/template/demo/mayland/cassel/',
			fonts: {
				headings: 'Playfair Display',
				base: 'Fira Sans',
			},
			categories: [ 'featured', 'blog' ],
		},
		{
			title: 'Overton',
			slug: 'overton',
			template: 'overton',
			theme: 'alves',
			src: 'https://public-api.wordpress.com/rest/v1/template/demo/alves/overton/',
			fonts: {
				headings: 'Cabin',
				base: 'Raleway',
			},
			categories: [ 'featured', 'business' ],
		},
		{
			title: 'Doyle',
			slug: 'doyle',
			template: 'doyle',
			theme: 'alves',
			src: 'https://public-api.wordpress.com/rest/v1/template/demo/alves/doyle/',
			fonts: {
				headings: 'Playfair Display',
				base: 'Fira Sans',
			},
			categories: [ 'featured', 'business' ],
		},
		{
			title: 'Brice',
			slug: 'brice',
			template: 'brice',
			theme: 'mayland',
			src: 'https://public-api.wordpress.com/rest/v1/template/demo/mayland/brice/',
			fonts: {
				headings: 'Playfair Display',
				base: 'Fira Sans',
			},
			categories: [ 'featured', 'charity', 'non-profit' ],
		},
	],
};

export default availableDesigns;
interface AvailableDesigns {
	featured: Array< import('./stores/onboard/types').Design >;
}
