import { formatCurrency } from '@automattic/number-formatters';
import {
	ExternalLink,
	Icon,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { check, code, lockOutline, plus, trendingUp } from '@wordpress/icons';
import enterpriseTestimonial1 from 'calypso/assets/images/a8c-for-agencies/hosting/enterprise-testimonial-1.webp';
import enterpriseTestimonial2 from 'calypso/assets/images/a8c-for-agencies/hosting/enterprise-testimonial-2.webp';
import premierTestimonial1 from 'calypso/assets/images/a8c-for-agencies/hosting/premier-testimonial-1.webp';
import premierTestimonial2 from 'calypso/assets/images/a8c-for-agencies/hosting/premier-testimonial-2.webp';
import standardTestimonial1 from 'calypso/assets/images/a8c-for-agencies/hosting/standard-testimonial-1.webp';
import standardTestimonial2 from 'calypso/assets/images/a8c-for-agencies/hosting/standard-testimonial-2.webp';
import { useAnalytics } from '../../../app/analytics';
import { Card, CardBody, CardHeader } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import jetpackDescriptor from '../exclusive-offers/images/jetpack-descriptor.svg';
import type { ReactNode } from 'react';

export type HostingBrand = 'wpcom' | 'pressable' | 'vip';

/** The round brand badge cropped out of a descriptor lockup. */
export function BrandMark( { src }: { src: string } ) {
	return <img src={ src } alt="" className="dashboard-marketplace-hosting__brand-mark" />;
}

export function CheckList( { items }: { items: ReactNode[] } ) {
	return (
		<ul className="dashboard-marketplace-hosting__list">
			{ items.map( ( item, index ) => (
				<li key={ index }>
					<Icon icon={ check } size={ 20 } />
					<Text>{ item }</Text>
				</li>
			) ) }
		</ul>
	);
}

export function CheckGrid( { items, columns = 2 }: { items: ReactNode[]; columns?: 2 | 3 } ) {
	return (
		<ul
			className={ `dashboard-marketplace-hosting__list dashboard-marketplace-hosting__list--columns-${ columns }` }
		>
			{ items.map( ( item, index ) => (
				<li key={ index }>
					<Icon icon={ check } size={ 20 } />
					<Text>{ item }</Text>
				</li>
			) ) }
		</ul>
	);
}

// WordPress.com's free domain only comes with yearly billing.
function getLastSiteManagementItems( brand: HostingBrand, showFreeDomain: boolean ): string[] {
	if ( brand !== 'wpcom' ) {
		return [ __( 'Smart redirects' ) ];
	}
	return showFreeDomain ? [ __( 'Free domain for one year' ) ] : [];
}

interface HostingFeaturesProps {
	brand: 'wpcom' | 'pressable';
	/** BD monthly WordPress.com plans do not include a free domain. */
	showFreeDomain?: boolean;
}

export function HostingFeatures( { brand, showFreeDomain = true }: HostingFeaturesProps ) {
	const columns = [
		{
			icon: trendingUp,
			title: __( 'Performance' ),
			items: [
				__( 'High-frequency CPUs' ),
				__( 'Auto-scaling PHP workers' ),
				__( 'Automated datacenter failover' ),
				__( 'Uptime monitoring' ),
			],
		},
		{
			icon: lockOutline,
			title: __( 'Security' ),
			items: [
				__( 'DDoS protection' ),
				__( 'Web application firewall' ),
				__( 'Malware detection & removal' ),
				__( 'Isolated site infrastructure' ),
			],
		},
		{
			icon: code,
			title: __( 'Developer tools' ),
			items: [
				__( 'WP-CLI access' ),
				__( 'SSH/SFTP access' ),
				__( 'GitHub deployments' ),
				__( 'Local development environment' ),
			],
		},
		{
			icon: plus,
			title: __( 'Site management' ),
			items: [
				__( 'Free managed migrations' ),
				__( 'Multi-site management' ),
				__( 'Site analytics' ),
				...getLastSiteManagementItems( brand, showFreeDomain ),
			],
		},
	];

	return (
		<Card>
			<CardHeader>
				<SectionHeader
					level={ 3 }
					title={
						brand === 'pressable'
							? __( 'More Pressable features' )
							: __( 'More WordPress.com features' )
					}
				/>
			</CardHeader>
			<CardBody>
				<div className="dashboard-marketplace-hosting__grid dashboard-marketplace-hosting__grid--4">
					{ columns.map( ( column ) => (
						<VStack key={ column.title } spacing={ 4 } justify="flex-start">
							<HStack spacing={ 2 } justify="flex-start" alignment="center" expanded={ false }>
								<Icon
									icon={ column.icon }
									size={ 20 }
									className="dashboard-marketplace-hosting__feature-icon"
								/>
								<Text variant="muted" size={ 11 } weight={ 500 } lineHeight="16px" upperCase>
									{ column.title }
								</Text>
							</HStack>
							<CheckList items={ column.items } />
						</VStack>
					) ) }
				</div>
			</CardBody>
		</Card>
	);
}

interface Testimonial {
	name: string;
	avatar: string;
	title: string;
	quote: string;
	link: { label: string; url: string };
}

const getTestimonials = (): Record< HostingBrand, Testimonial[] > => ( {
	wpcom: [
		{
			name: 'Ajit Bohra',
			avatar: standardTestimonial1,
			/* translators: %s is the name of the company the testimonial is about. */
			title: sprintf( __( 'Founder, %s' ), 'LUBUS' ),
			quote: __(
				'We aimed to provide clients with a reliable hosting service we could endorse without hesitation, ultimately resulting in satisfied clients. We found that service with WordPress.com.'
			),
			link: { label: 'lubus.in', url: 'https://lubus.in' },
		},
		{
			name: 'Brian Lalli',
			avatar: standardTestimonial2,
			/* translators: %s is the name of the company the testimonial is about. */
			title: sprintf( __( 'President, %s' ), 'Moon Rooster LLC' ),
			quote: __(
				'WordPress.com has been crucial to my agency’s growth. Its intuitive UI allows me to quickly create sleek, functional websites for my clients, and their reliable hosting and support enable me to rest easy, knowing my sites are in good hands.'
			),
			link: { label: 'moonrooster.com', url: 'https://moonrooster.com' },
		},
	],
	pressable: [
		{
			name: 'Ben Giordano',
			avatar: premierTestimonial1,
			/* translators: %s is the name of the company the testimonial is about. */
			title: sprintf( __( 'Founder, %s' ), 'Freshy' ),
			quote: __(
				'We needed a hosting provider that was as knowledgeable about WordPress as we are. With Pressable’s affiliation with Automattic, the same people behind WordPress.com and WordPress VIP, we knew we’d found the right home for our client portfolio.'
			),
			link: { label: 'freshysites.com', url: 'https://freshysites.com' },
		},
		{
			name: 'Justin Barrett',
			avatar: premierTestimonial2,
			/* translators: %s is the name of the company the testimonial is about. */
			title: sprintf( __( 'Director of Technology, %s' ), 'Autoshop Solutions' ),
			quote: __(
				'As an agency with hundreds of clients, Pressable changed the game for our ability to grow as a business and offer best-in-class products for our clients. With fantastic support, superior uptime, and solutions to make even the largest challenges possible, Pressable is always there.'
			),
			link: { label: 'autoshopsolutions.com', url: 'https://autoshopsolutions.com' },
		},
	],
	vip: [
		{
			name: 'David Rousseau',
			avatar: enterpriseTestimonial1,
			/* translators: %s is the name of the company the testimonial is about. */
			title: sprintf( __( 'Vice President, %s' ), 'Kaiser Family Foundation' ),
			quote: __(
				'In the past, the staff didn’t touch the CMS. They wrote things in Word, sent it to the production team, and they put it online. With WordPress, that workflow is changing slowly and dramatically. We’ve trained many of our content creators in the CMS. And, the closer the content creators are to it, the more creatively they are able to think about it.'
			),
			link: {
				label: __( 'Read the case study' ),
				url: 'https://wpvip.com/case-studies/evolving-the-kaiser-family-foundations-data-rich-platforms/',
			},
		},
		{
			name: 'Joel Davies',
			avatar: enterpriseTestimonial2,
			/* translators: %s is the name of the company the testimonial is about. */
			title: sprintf( __( 'Head of Editorial Operations, %s' ), 'News UK' ),
			quote: __(
				'With Gutenberg, we were able to publish a breaking news story in two minutes versus five minutes in Classic [WordPress]. The main reason for this is the reusable blocks which have been renamed ‘The Game Changer.’'
			),
			link: {
				label: __( 'Read the case study' ),
				url: 'https://wpvip.com/case-studies/behind-the-scenes-of-news-uks-rampant-speed-to-value-with-gutenberg/',
			},
		},
	],
} );

export function Testimonials( { brand }: { brand: HostingBrand } ) {
	return (
		<Card>
			<CardHeader>
				<SectionHeader level={ 3 } title={ __( 'What agencies say' ) } />
			</CardHeader>
			<CardBody>
				<div className="dashboard-marketplace-hosting__grid dashboard-marketplace-hosting__grid--2">
					{ getTestimonials()[ brand ].map( ( testimonial ) => (
						<VStack key={ testimonial.name } spacing={ 4 } justify="space-between">
							<Text as="p">{ testimonial.quote }</Text>
							<HStack spacing={ 3 } justify="flex-start" alignment="flex-start" expanded={ false }>
								<img
									src={ testimonial.avatar }
									alt=""
									className="dashboard-marketplace-hosting__avatar"
								/>
								<VStack spacing={ 0.5 }>
									<Text weight={ 600 }>{ testimonial.name }</Text>
									<Text variant="muted">{ testimonial.title }</Text>
									<ExternalLink href={ testimonial.link.url }>
										{ testimonial.link.label }
									</ExternalLink>
								</VStack>
							</HStack>
						</VStack>
					) ) }
				</div>
			</CardBody>
		</Card>
	);
}

export function JetpackComplete() {
	const { recordTracksEvent } = useAnalytics();

	return (
		<Card>
			<CardHeader>
				<SectionHeader
					className="dashboard-marketplace-hosting__card-header"
					level={ 3 }
					title={ __( 'Jetpack Complete included' ) }
					description={ sprintf(
						/* translators: %s is the yearly price of Jetpack Complete. */
						__(
							'Supercharge your clients’ sites. Every Pressable site comes with a free Jetpack Complete license, a %s/year/site value.'
						),
						formatCurrency( 899, 'USD' )
					) }
					decoration={ <BrandMark src={ jetpackDescriptor } /> }
				/>
			</CardHeader>
			<CardBody>
				<CheckGrid
					items={ [
						__( 'VaultPress Backup w/ 1TB storage' ),
						__( 'Scan w/ WAF' ),
						__( 'Akismet Anti-spam w/ 60k API calls/mo' ),
						__( 'Stats (Paid) w/ 100k views/mo' ),
						__( 'VideoPress w/ 1TB storage' ),
						__( 'Boost w/ Auto CSS Generation' ),
						__( 'Social Advanced w/ unlimited shares' ),
						__( 'Site Search up to 100k records and 100k requests/mo' ),
						__( 'CRM Entrepreneur' ),
						__( 'All Jetpack features' ),
						createInterpolateElement( __( '<a>And more</a>' ), {
							a: (
								<ExternalLink
									href="https://jetpack.com/complete/"
									onClick={ () =>
										recordTracksEvent( 'a4a_hosting_premier_jetpack_complete_more_link_click' )
									}
									children={ null }
								/>
							),
						} ),
					] }
				/>
			</CardBody>
		</Card>
	);
}
