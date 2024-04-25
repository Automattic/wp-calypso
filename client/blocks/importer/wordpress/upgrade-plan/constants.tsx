import { shield, trendingUp, chartBar } from '@wordpress/icons';
import { translate, useTranslate } from 'i18n-calypso';
import customerImageAjitBohra from 'calypso/assets/images/migrations/customer-testimonials/ajit-bohra.jpg';
import customerImageChrisCoyier from 'calypso/assets/images/migrations/customer-testimonials/chris-coyier.jpg';
import customerImageEmmaLucasCopley from 'calypso/assets/images/migrations/customer-testimonials/emma-lucas-copley.jpg';

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
];

export function useUpgradePlanHostingDetailsList() {
	const translate = useTranslate();

	return [
		{
			title: translate( 'Reduced error rate' ),
			description: translate( '16% fewer errors' ),
			icon: shield,
		},
		{
			title: translate( 'Increased speed' ),
			description: translate( '30% faster' ),
			icon: trendingUp,
		},
		{
			title: translate( 'Higher availability' ),
			description: translate( '3% better uptime' ),
			icon: chartBar,
		},
	];
}
