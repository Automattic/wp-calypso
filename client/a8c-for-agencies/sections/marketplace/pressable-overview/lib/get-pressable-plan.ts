export type PressablePlan = {
	slug: string;
	install: number;
	visits: number;
	storage: number;
};

const PLAN_DATA: Record< string, PressablePlan > = {
	'pressable-wp-1': {
		slug: 'pressable-wp-1',
		install: 1,
		visits: 50000,
		storage: 20,
	},
	'pressable-wp-2': {
		slug: 'pressable-wp-2',
		install: 5,
		visits: 100000,
		storage: 50,
	},
	'pressable-wp-3': {
		slug: 'pressable-wp-3',
		install: 10,
		visits: 250000,
		storage: 80,
	},
	'pressable-wp-4': {
		slug: 'pressable-wp-4',
		install: 25,
		visits: 500000,
		storage: 175,
	},
	'pressable-wp-5': {
		slug: 'pressable-wp-5',
		install: 50,
		visits: 1000000,
		storage: 250,
	},
	'pressable-wp-6': {
		slug: 'pressable-wp-6',
		install: 75,
		visits: 1500000,
		storage: 350,
	},
	'pressable-wp-7': {
		slug: 'pressable-wp-7',
		install: 100,
		visits: 2000000,
		storage: 500,
	},
};

export default function getPressablePlan( slug: string ) {
	return PLAN_DATA[ slug ];
}

export function getAllPressablePlans() {
	return Object.keys( PLAN_DATA );
}
