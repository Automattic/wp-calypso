import shuffle from 'lodash/shuffle';

const map = {
	blog: [
		{ name: 'Button', slug: 'button' },
		{ name: 'Franklin', slug: 'franklin' },
		{ name: 'Sapor', slug: 'sapor' },
		{ name: 'Colinear', slug: 'colinear' },
		{ name: 'Minnow', slug: 'minnow' },
		{ name: 'Eighties', slug: 'eighties' },
		{ name: 'Libre', slug: 'libre' },
		{ name: 'Penscratch', slug: 'penscratch' },
		{ name: 'Libretto', slug: 'libretto' },
	],
	page: [
		{ name: 'Gateway', slug: 'gateway' },
		{ name: 'Edin', slug: 'edin' },
		{ name: 'Sequential', slug: 'sequential' },
		{ name: 'Goran', slug: 'goran' },
		{ name: 'Sela', slug: 'sela' },
		{ name: 'Motif', slug: 'motif' },
		{ name: 'Big Brother', slug: 'big-brother' },
		{ name: 'Argent', slug: 'argent' },
		{ name: 'Harmonic', slug: 'harmonic' },
	],
	grid: [
		{ name: 'Dyad', slug: 'dyad' },
		{ name: 'Blask', slug: 'blask' },
		{ name: 'Cubic', slug: 'cubic' },
		{ name: 'Illustratr', slug: 'illustratr' },
		{ name: 'Snaps', slug: 'snaps' },
		{ name: 'Sketch', slug: 'sketch' },
		{ name: 'Gazette', slug: 'gazette' },
		{ name: 'Apostrophe', slug: 'apostrophe' },
		{ name: 'Pictorico', slug: 'pictorico' },
	]
};

export default function getThemes( key ) {
	return shuffle( map[ key ] || [] );
}
