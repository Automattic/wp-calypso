import { shield, trendingUp, chartBar } from '@wordpress/icons';
import { translate } from 'i18n-calypso';

export const UpgradePlanHostingTestimonials = [
	{
		customerImage: null,
		customerName: 'WP Hosting Benchmarks',
		customerTestimonial: translate(
			`Perfect uptime on both monitors. WordPress.com also managed to pickup the fastest WP Bench score and an A+ SSL grade. It’s easy to say WordPress.com handled these tests without blinking.`
		),
	},
	{
		customerImage: null,
		customerName: 'Tommaso Pirola',
		customerTestimonial: translate(
			`"So we actually migrated to WordPress.com paying 15 euros a month [at that time]. So, from 450 to 15. In website speed and reliability and uptime, we never had a problem ever since."`
		),
		customerInfo: translate( `Longterm customer recounting switch from AWS` ),
	},
	{
		customerImage: null,
		customerName: 'Deepak Kumar',
		customerTestimonial: translate(
			`"Deepak’s website, currently garnering over 2.9 million monthly pageviews, is efficiently handled by WordPress.com. Deepak is especially pleased with the platform’s capability to manage high-traffic volumes seamlessly."`
		),
		customerInfo: translate( `Business plan customer case study` ),
	},
	{
		customerImage: null,
		customerName: 'Antony Angel',
		customerTestimonial: translate(
			`"We aimed to provide clients with a reliable hosting service we could endorse without hesitation, ultimately resulting in satisfied clients. We found that service with WordPress.com."`
		),
		customerInfo: 'AntonyAgnel.com',
	},
	{
		customerImage: null,
		customerName: 'Chris Coyier',
		customerTestimonial: translate(
			`"With WordPress.com, you’re in good hands. Your site has the speed it needs. It won’t go offline. And it’s not going to be hacked. When it comes to the difficult stuff — it’s all taken care of."`
		),
	},
];

export const UpgradePlanHostingDetailsList = [
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
