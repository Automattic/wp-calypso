export const customTags = {
	YOUTUBE: Symbol( 'youtube' ),
};

export const allowedTags = {
	'#text': {},
	a: {
		href: true,
	},
	b: {},
	blockquote: {},
	code: {},
	div: {
		class: true,
	},
	em: {},
	h1: {},
	h2: {},
	h3: {},
	h4: {},
	h5: {},
	h6: {},
	i: {},
	img: {
		alt: true,
		src: true,
	},
	li: {},
	ol: {},
	p: {},
	span: {},
	strong: {},
	ul: {},

	// Although iframe is not allowed, we'll still want to allow YouTube embeds and valitate their attributes.
	[ customTags.YOUTUBE ]: {
		class: true,
		type: true,
		height: true,
		width: true,
		src: true,
	},
};
