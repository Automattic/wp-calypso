export type PressablePlan = {
	slug: string;
	install: number;
	visits: number;
	storage: number;
};

const PLAN_DATA: Record< string, PressablePlan > = {
	'jetpack-pressable-personal': {
		slug: 'jetpack-pressable-personal',
		install: 1,
		visits: 30000,
		storage: 20,
	},
	'jetpack-pressable-starter': {
		slug: 'jetpack-pressable-starter',
		install: 3,
		visits: 50000,
		storage: 30,
	},
	'jetpack-pressable-advanced': {
		slug: 'jetpack-pressable-advanced',
		install: 5,
		visits: 75000,
		storage: 35,
	},
	'jetpack-pressable-pro': {
		slug: 'jetpack-pressable-pro',
		install: 10,
		visits: 150000,
		storage: 50,
	},
	'jetpack-pressable-premium': {
		slug: 'jetpack-pressable-premium',
		install: 20,
		visits: 400000,
		storage: 80,
	},
	'jetpack-pressable-business': {
		slug: 'jetpack-pressable-business',
		install: 50,
		visits: 1000000,
		storage: 200,
	},
	'jetpack-pressable-business-80': {
		slug: 'jetpack-pressable-business-80',
		install: 80,
		visits: 1600000,
		storage: 275,
	},
	'jetpack-pressable-business-100': {
		slug: 'jetpack-pressable-business-100',
		install: 100,
		visits: 2000000,
		storage: 325,
	},
};

export default function getPressablePlan( slug: string ) {
	return PLAN_DATA[ slug ];
}
