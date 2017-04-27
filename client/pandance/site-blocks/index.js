import { Logo, EditLogo } from './components/logo';
import ContactForm from './components/contact-form';
import { WorkingHours, EditWorkingHours } from './components/working-hours';
import { SocialMedia, EditSocialMedia } from './components/social-media';
import { ContactInfo, EditContactInfo } from './components/contact-info';
import Map from './components/map';

export default [
	{
		id: 1,
		name: 'Logo',
		component: Logo,
		editComponent: EditLogo
	},
	{
		id: 2,
		name: 'Working hours',
		component: WorkingHours,
		editComponent: EditWorkingHours,
	},
	{
		id: 3,
		name: 'Contact Info',
		component: ContactInfo,
		editComponent: EditContactInfo,
	},
	{
		id: 4,
		name: 'Map',
		component: Map
	},
	{
		id: 5,
		name: 'Contact Form',
		component: ContactForm
	},
	{
		id: 6,
		name: 'Social Media',
		component: SocialMedia,
		editComponent: EditSocialMedia
	},
];
