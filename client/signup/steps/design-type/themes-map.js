import shuffle from 'lodash/shuffle';

const map = {
	blog: [
		{ name: 'Button', slug: 'button' },
		{ name: 'Franklin', slug: 'franklin' },
		{ name: 'Sapor', slug: 'sapor' },
		{ name: 'Twenty Sixteen', slug: 'twentysixteen' },
		{ name: 'Hemingway Rewritten', slug: 'hemingway-rewritten' },
		{ name: 'Independent Publisher', slug: 'independent-publisher' },
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
		{ name: 'Pique', slug: 'pique' },
		{ name: 'Harmonic', slug: 'harmonic' },
	],
	grid: [
		{ name: 'Dyad', slug: 'dyad' },
		{ name: 'Baskerville', slug: 'baskerville' },
		{ name: 'Cubic', slug: 'cubic' },
		{ name: 'Revelar', slug: 'revelar' },
		{ name: 'Rowling', slug: 'rowling' },
		{ name: 'Spun', slug: 'spun' },
		{ name: 'Gazette', slug: 'gazette' },
		{ name: 'Apostrophe', slug: 'apostrophe' },
		{ name: 'Pictorico', slug: 'pictorico' },
	]
};

export default function getThemes( key ) {
	return shuffle( map[ key ] || [] );
}
