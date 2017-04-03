import Logo from './components/logo';
import ContactForm from './components/contact-form';
import WorkingHours from './components/working-hours';
import SocialMedia from './components/social-media';
import ContactInfo from './components/contact-info';
import Map from './components/map';
import Header from './components/header';

export default [
	{
		id: 1,
		name: 'Logo',
		component: Logo
	},
	{
		id: 2,
		name: 'Header',
		component: Header
	},
	{
		id: 3,
		name: 'Working hours',
		component: WorkingHours
	},
	{
		id: 4,
		name: 'Contact Info',
		component: ContactInfo
	},
	{
		id: 5,
		name: 'Map',
		component: Map
	},
	{
		id: 6,
		name: 'Contact Form',
		component: ContactForm
	},
	{
		id: 7,
		name: 'Social Media',
		component: SocialMedia
	},
];
