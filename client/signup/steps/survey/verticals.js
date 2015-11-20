import { translate } from 'lib/mixins/i18n';

const verticals = [
	{ value: 'a8c.1', label: translate( 'Arts and Entertainment' ), stepTwo: [
		{ value: 'a8c.1', label: translate( 'General Arts and Entertainment' ) },
		{ value: 'a8c.1.3.1', label: translate( 'Creative Arts and Design' ) },
		{ value: 'a8c.1.3.2', label: translate( 'Entertainment and Culture' ) },
	] },
	{ value: 'a8c.3', label: translate( 'Business and Services' ), stepTwo: [
		{ value: 'a8c.3', label: translate( 'General Business and Services' ) },
		{ value: 'a8c.3.0.1', label: translate( 'Finance and Law' ) },
		{ value: 'a8c.3.0.2', label: translate( 'Consulting and Coaching' ) },
	] },
];

export default {
	get() {
		return verticals;
	}
}
