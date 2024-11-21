export type PressablePlan = {
	slug: string;
	install: number;
	visits: number;
	storage: number;
	category?: string;
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

	// New pressable plans
	'pressable-build': {
		slug: 'pressable-build',
		install: 1,
		visits: 30000,
		storage: 20,
	},
	'pressable-growth': {
		slug: 'pressable-growth',
		install: 3,
		visits: 50000,
		storage: 30,
	},
	'pressable-advanced': {
		slug: 'pressable-advanced',
		install: 5,
		visits: 75000,
		storage: 35,
	},
	'pressable-pro': {
		slug: 'pressable-pro',
		install: 10,
		visits: 150000,
		storage: 50,
	},
	'pressable-premium': {
		slug: 'pressable-premium',
		install: 20,
		visits: 400000,
		storage: 80,
	},
	'pressable-business': {
		slug: 'pressable-business',
		install: 50,
		visits: 1000000,
		storage: 200,
	},
	'pressable-business-80': {
		slug: 'pressable-business-80',
		install: 80,
		visits: 1600000,
		storage: 275,
	},
	'pressable-business-100': {
		slug: 'pressable-business-100',
		install: 100,
		visits: 2000000,
		storage: 325,
	},
	'pressable-business-120': {
		slug: 'pressable-business-120',
		install: 120,
		visits: 2400000,
		storage: 375,
	},
	'pressable-business-150': {
		slug: 'pressable-business-150',
		install: 150,
		visits: 3000000,
		storage: 450,
	},

	// Pressable Enterprise plans
	'pressable-enterprise-4': {
		slug: 'pressable-enterprise-4',
		install: 200,
		visits: 4000000,
		storage: 500,
	},
	'pressable-enterprise-5': {
		slug: 'pressable-enterprise-5',
		install: 250,
		visits: 5000000,
		storage: 550,
	},
	'pressable-enterprise-6': {
		slug: 'pressable-enterprise-6',
		install: 300,
		visits: 6000000,
		storage: 600,
	},
	'pressable-enterprise-7': {
		slug: 'pressable-enterprise-7',
		install: 350,
		visits: 7000000,
		storage: 700,
	},
	'pressable-enterprise-8': {
		slug: 'pressable-enterprise-8',
		install: 400,
		visits: 8000000,
		storage: 800,
	},
	'pressable-enterprise-9': {
		slug: 'pressable-enterprise-9',
		install: 450,
		visits: 9000000,
		storage: 900,
	},
	'pressable-enterprise-10': {
		slug: 'pressable-enterprise-10',
		install: 500,
		visits: 10000000,
		storage: 1000,
	},
};

export default function getPressablePlan( slug: string ) {
	return addCategoryToPlan( PLAN_DATA[ slug ] );
}

export function getAllPressablePlans() {
	return Object.keys( PLAN_DATA );
}

function addCategoryToPlan( plan: PressablePlan ) {
	if ( plan.slug.startsWith( 'pressable-enterprise' ) ) {
		plan.category = 'enterprise';
	} else {
		plan.category = 'standard';
	}
	return plan;
}
