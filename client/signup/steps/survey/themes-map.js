import shuffle from 'lodash/shuffle';

const map = {
	healthAndWellness: [
		{ name: 'Resonar', slug: 'resonar' },
		{ name: 'Sapor', slug: 'sapor' },
		{ name: 'Cerauno', slug: 'cerauno' },
		{ name: 'Rowling', slug: 'rowling' },
		{ name: 'Sela', slug: 'sela' },
		{ name: 'Colinear', slug: 'colinear' },
		{ name: 'Hemingway Rewritten', slug: 'hemingway-rewritten' },
		{ name: 'Twenty Sixteen', slug: 'twentysixteen' },
		{ name: 'Dyad', slug: 'dyad' },
	],
	writingAndBooks: [
		{ name: 'Penscratch', slug: 'penscratch' },
		{ name: 'Hemingway Rewritten', slug: 'hemingway-rewritten' },
		{ name: 'Libre', slug: 'libre' },
		{ name: 'Editor', slug: 'editor' },
		{ name: 'Independent Publisher', slug: 'independent-publisher' },
		{ name: 'Scrawl', slug: 'scrawl' },
		{ name: 'Twenty Sixteen', slug: 'twentysixteen' },
		{ name: 'Cols', slug: 'cols' },
		{ name: 'Edda', slug: 'edda' },
	],
	educationAndOrganizations: [
		{ name: 'Big Brother', slug: 'big-brother' },
		{ name: 'Motif', slug: 'motif' },
		{ name: 'Edin', slug: 'edin' },
		{ name: 'Cerauno', slug: 'cerauno' },
		{ name: 'Sela', slug: 'sela' },
		{ name: 'Plane', slug: 'plane' },
		{ name: 'Gateway', slug: 'gateway' },
		{ name: 'Sequential', slug: 'sequential' },
		{ name: 'Rowling', slug: 'rowling' },
	],
	familyHomeAndLifestyle: [
		{ name: 'Button', slug: 'button' },
		{ name: 'Sobe', slug: 'sobe' },
		{ name: 'Resonar', slug: 'resonar' },
		{ name: 'Affinity', slug: 'affinity' },
		{ name: 'Sapor', slug: 'sapor' },
		{ name: 'Scratchpad', slug: 'scratchpad' },
		{ name: 'Hemingway Rewritten', slug: 'hemingway-rewritten'},
		{ name: 'Dyad', slug: 'dyad' },
		{ name: 'Celsius', slug: 'celsius' },
	],
	artsAndEntertainment: [
		{ name: 'Harmonic', slug: 'harmonic' },
		{ name: 'Cubic', slug: 'cubic' },
		{ name: 'Pique', slug: 'pique' },
		{ name: 'Intergalactic', slug: 'intergalactic' },
		{ name: 'Afterlight', slug: 'afterlight' },
		{ name: 'Eighties', slug: 'eighties' },
		{ name: 'Coherent', slug: 'coherent' },
		{ name: 'Singl', slug: 'singl' },
		{ name: 'Affinity', slug: 'affinity' },
	],
	businessAndServices: [
		{ name: 'Gateway', slug: 'gateway' },
		{ name: 'Edin', slug: 'edin' },
		{ name: 'Affinity', slug: 'affinity' },
		{ name: 'Goran', slug: 'goran' },
		{ name: 'Sela', slug: 'sela' },
		{ name: 'Motif', slug: 'motif' },
		{ name: 'Big Brother', slug: 'big-brother' },
		{ name: 'Pique', slug: 'pique' },
		{ name: 'Harmonic', slug: 'harmonic' },
	]
};

export default function getThemes( key ) {
	return shuffle( map[ key ] || [] );
}
