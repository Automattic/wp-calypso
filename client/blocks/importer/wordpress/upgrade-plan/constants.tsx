import { translate } from 'i18n-calypso';
import customerImageAjitBohra from 'calypso/assets/images/migrations/customer-testimonials/ajit-bohra.jpg';
import customerImageAntonyAgnel from 'calypso/assets/images/migrations/customer-testimonials/antony-agnel.jpg';
import customerImageChrisCoyier from 'calypso/assets/images/migrations/customer-testimonials/chris-coyier.jpg';
import customerImageEmmaLucasCopley from 'calypso/assets/images/migrations/customer-testimonials/emma-lucas-copley.jpg';

// Threshold for a website that has a "good" Largest Contentful Paint (LCP) score according to Core Web Vital metrics.
// A "good" LCP score is considered to be 2.5 seconds or less.
export const upgradePlanSiteMetricsLcpThreshold = 2500;

// Threshold for a website that has a "good" First Input Delay (FID) score according to Core Web Vital metrics.
// A "good" FID score is considered to be 100 milliseconds or less.
export const upgradePlanSiteMetricsFidThreshold = 100;

export const UpgradePlanHostingTestimonials = [
	{
		customerImage: customerImageAjitBohra,
		customerName: 'Ajit Bohra',
		customerTestimonial: translate(
			`"We aimed to provide clients with a reliable hosting service we could endorse without hesitation, ultimately resulting in satisfied clients. We found that service with WordPress.com."`
		),
		customerInfo: 'WordPress.com News',
	},
	{
		customerImage: customerImageChrisCoyier,
		customerName: 'Chris Coyier',
		customerTestimonial: translate(
			`"With WordPress.com, you’re in good hands. Your site has the speed it needs. It won’t go offline. And it’s not going to be hacked. When it comes to the difficult stuff — it’s all taken care of."`
		),
		customerInfo: 'chriscoyier.net',
	},
	{
		customerImage: customerImageEmmaLucasCopley,
		customerName: 'Emma Lucas-Copley',
		customerTestimonial: translate(
			`"7 years ago I decided to FINALLY begin my book blog, and I opened my Wordpress account after reading so many great reviews. I've never looked back. With their easy to use website features, fantastic support team and great collection of themes to choose from, my website was simple to build, update and maintain."`
		),
		customerInfo: 'papyrusandpeppermint.com',
	},
	{
		customerImage: customerImageAntonyAgnel,
		customerName: 'Antony Agnel',
		customerTestimonial: translate(
			`"After moving my website to WordPress.com, my site never crashed due to WordPress upgrades. Thanks to their rigorous testing and quality assurance – I could proudly say that my site never went down due to any WordPress upgrade."`
		),
		customerInfo: 'AntonyAgnel.com',
	},
];
