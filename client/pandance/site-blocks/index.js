import { Logo, EditLogo } from './components/logo';
import ContactForm from './components/contact-form';
import { WorkingHours, EditWorkingHours } from './components/working-hours';
import { SocialMedia, EditSocialMedia } from './components/social-media';
import { ContactInfo, EditContactInfo } from './components/contact-info';
import Map from './components/map';
import Header from './components/header';

export default [
	{
		id: 1,
		name: 'Logo',
		component: Logo,
		editComponent: EditLogo
	},
	{
		id: 2,
		name: 'Header',
		component: Header
	},
	{
		id: 3,
		name: 'Working hours',
		component: WorkingHours,
		editComponent: EditWorkingHours,
	},
	{
		id: 4,
		name: 'Contact Info',
		component: ContactInfo,
		editComponent: EditContactInfo,
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
		component: SocialMedia,
		editComponent: EditSocialMedia
	},
];
