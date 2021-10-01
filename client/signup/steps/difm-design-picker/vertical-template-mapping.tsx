import IT_1 from 'calypso/assets/images/difm/IT-1.png';
import consult_1 from 'calypso/assets/images/difm/consult-1.png';
import consult_2 from 'calypso/assets/images/difm/consult-2.png';
import dietician_1 from 'calypso/assets/images/difm/dietician-1.png';
import musician_1 from 'calypso/assets/images/difm/musician-1.png';
import photography_1 from 'calypso/assets/images/difm/photography-1.png';
import phsych_1 from 'calypso/assets/images/difm/phsych-1.png';
import restaurant_1 from 'calypso/assets/images/difm/restaurant-1.png';
import tree_removal from 'calypso/assets/images/difm/tree-removal.png';

const template_url_consult_1 = 'https://consultantbuiltbylite.wordpress.com/';
const template_url_consult_2 = 'https://bbconsulting737758387.wordpress.com/';
const template_url_tree_removal = 'https://bobstreeremoval.wordpress.com/';
const template_url_IT_1 = 'https://difmlitetechcorp.wordpress.com/';
const template_url_phsych_1 = 'https://miriamspsychologypractise.wordpress.com//';
const template_url_restaurant_1 = 'https://dfimliterestaurant.wordpress.com/';
const template_url_dietician_1 = 'https://kristyrobbins345810057.wordpress.com/';
const template_url_photographer_1 = 'https://localphotographersite.wordpress.com/';
const template_url_musician_1 = 'https://sinatrasworld845548587.wordpress.com/';

const VerticalTemplateMapping = {
	'Local services': {
		name: 'Local services',
		templates: [
			{
				name: 'local services 1',
				displayName: 'local services 1',
				thumbnail: consult_1,
				templateUrl: template_url_consult_1,
			},
			{
				name: 'local services 2',
				displayName: 'local services 2',
				thumbnail: consult_2,
				templateUrl: template_url_consult_2,
			},
			{
				name: 'local services 3',
				displayName: 'local services 3',
				thumbnail: tree_removal,
				templateUrl: template_url_tree_removal,
			},
			{
				name: 'local services 4',
				displayName: 'Local services 4',
				thumbnail: IT_1,
				templateUrl: template_url_IT_1,
			},
		],
	},
	'Professional Services': {
		name: 'Professional Services',
		templates: [
			{
				name: 'professional Services 1',
				displayName: 'professional Services 1',
				thumbnail: consult_1,
				templateUrl: template_url_consult_1,
			},
			{
				name: 'professional services 2',
				displayName: 'professional services 2',
				thumbnail: consult_2,
				templateUrl: template_url_consult_2,
			},
			{
				name: 'professional services 3',
				displayName: 'professional services 3',
				thumbnail: tree_removal,
				templateUrl: template_url_tree_removal,
			},
			{
				name: 'professional services 4',
				displayName: 'professional services 4',
				thumbnail: IT_1,
				templateUrl: template_url_IT_1,
			},
			{
				name: 'professional services 5',
				displayName: 'professional services 5',
				thumbnail: phsych_1,
				templateUrl: template_url_phsych_1,
			},
		],
	},
	Restaurant: {
		name: 'Restaurant',
		templates: [
			{
				name: 'restaurant 1',
				displayName: 'restaurant 1',
				thumbnail: restaurant_1,
				templateUrl: template_url_restaurant_1,
			},
			{
				name: 'restaurant 2',
				displayName: 'restaurant 2',
				thumbnail: dietician_1,
				templateUrl: template_url_dietician_1,
			},
		],
	},
	'Creative arts': {
		name: 'Creative arts',
		templates: [
			{
				name: 'Photographer',
				displayName: 'Photographer',
				thumbnail: photography_1,
				templateUrl: template_url_photographer_1,
			},
			{
				name: 'Musician',
				displayName: 'Musician',
				thumbnail: musician_1,
				templateUrl: template_url_musician_1,
			},
		],
	},
};
export default VerticalTemplateMapping;
