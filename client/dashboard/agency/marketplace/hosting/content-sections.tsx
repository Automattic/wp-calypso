import {
	ExternalLink,
	Icon,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { check } from '@wordpress/icons';
import { Card, CardBody } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';

const FEATURE_COLUMNS = [
	{
		title: __( 'Performance' ),
		features: [
			'Global edge caching',
			'Global CDN with 28+ locations',
			'High-frequency CPUs',
			'High-burst capacity',
			'Automated datacenter failover',
			'Extremely fast DNS with SSL',
			'10 PHP workers w/ auto-scaling',
			'Uptime monitoring',
		],
	},
	{
		title: __( 'Security' ),
		features: [
			'Real-time backups',
			'DDoS protection and mitigation',
			'Brute-force protection',
			'Malware detection & removal',
			'Spam protection with Akismet',
			'Web application firewall (WAF)',
			'One-click restores',
			'Automated WordPress updates',
			'Isolated site infrastructure',
		],
	},
	{
		title: __( 'Dev tools' ),
		features: [
			'Local development environment',
			'Free staging site',
			'WP-CLI access',
			'SSH/SFTP access',
			'GitHub deployments',
			'Plugin auto-updates',
			'Centralized site management',
			'Domain management',
			'Site activity log',
		],
	},
	{
		title: __( 'And more!' ),
		features: [
			'24/7 priority expert support',
			'Free managed migrations',
			'Install plugins and themes',
			'In-depth site analytics dashboard',
			'Elastic-powered search',
			'4K, unbranded VideoPress player',
			'Free domain for one year',
			'Smart redirects',
		],
	},
];

const TESTIMONIALS = [
	{
		quote:
			'We aimed to provide clients with a reliable hosting service we could endorse without hesitation, ultimately resulting in satisfied clients. We found that service with WordPress.com.',
		name: 'Ajit Bohra',
		role: 'Founder, LUBUS',
		linkLabel: 'lubus.in',
		linkUrl: 'https://lubus.in',
	},
	{
		quote:
			'WordPress.com has been crucial to my agency’s growth. Its intuitive UI allows me to quickly create sleek, functional websites for my clients, and their reliable hosting and support enable me to rest easy, knowing my sites are in good hands.',
		name: 'Brian Lalli',
		role: 'President, Moon Rooster LLC',
		linkLabel: 'moonrooster.com',
		linkUrl: 'https://moonrooster.com',
	},
];

const RELATIONSHIP_CARDS = [
	{
		title: __( 'Create trust' ),
		body: 'With over 15 years of experience running hundreds of millions of sites on WordPress.com, including the highest-trafficked sites globally, we’ve developed a platform we confidently put up against any cloud service.',
		features: [ '99.999% Uptime', 'High availability with automated scaling' ],
	},
	{
		title: __( 'Minimize risk' ),
		body: 'Automattic hosting plans offer exceptional security from day one, with the option to include or sell additional client-facing security features like real-time backups, anti-spam, and malware scanning.',
		features: [ 'Web Application Firewall', 'DDoS protection' ],
	},
	{
		title: __( 'Increase speed' ),
		body: 'We’re the only cloud platform team fully dedicated to optimizing WordPress. Your customers will feel the difference.',
		features: [ 'Incredibly low page speed index', 'Automated WordPress edge caching' ],
	},
];

function CheckList( { items }: { items: string[] } ) {
	return (
		<VStack spacing={ 2 }>
			{ items.map( ( item ) => (
				<HStack key={ item } spacing={ 2 } justify="flex-start" alignment="center">
					<Icon icon={ check } className="marketplace-hosting__check" />
					<Text>{ item }</Text>
				</HStack>
			) ) }
		</VStack>
	);
}

export function IncludedFeatures() {
	return (
		<VStack spacing={ 4 }>
			<SectionHeader title={ __( 'Included with every WordPress.com site' ) } level={ 2 } />
			<div className="marketplace-hosting__grid-4">
				{ FEATURE_COLUMNS.map( ( column ) => (
					<Card key={ column.title }>
						<CardBody>
							<VStack spacing={ 4 }>
								<Heading level={ 3 } size={ 13 } upperCase>
									{ column.title }
								</Heading>
								<CheckList items={ column.features } />
							</VStack>
						</CardBody>
					</Card>
				) ) }
			</div>
		</VStack>
	);
}

export function Testimonials() {
	return (
		<VStack spacing={ 4 }>
			<SectionHeader title={ __( 'Love for WordPress.com hosting' ) } level={ 2 } />
			<div className="marketplace-hosting__grid-2">
				{ TESTIMONIALS.map( ( testimonial ) => (
					<Card key={ testimonial.name }>
						<CardBody>
							<VStack spacing={ 4 }>
								<Text as="p">{ testimonial.quote }</Text>
								<VStack spacing={ 1 }>
									<Text weight={ 600 }>{ testimonial.name }</Text>
									<Text variant="muted">{ testimonial.role }</Text>
									<ExternalLink href={ testimonial.linkUrl }>
										{ testimonial.linkLabel }
									</ExternalLink>
								</VStack>
							</VStack>
						</CardBody>
					</Card>
				) ) }
			</div>
		</VStack>
	);
}

export function ClientRelationships() {
	return (
		<VStack spacing={ 4 }>
			<SectionHeader
				title={ __( 'Improve your client relationships with our hosting' ) }
				level={ 2 }
			/>
			<div className="marketplace-hosting__grid-3">
				{ RELATIONSHIP_CARDS.map( ( card ) => (
					<Card key={ card.title }>
						<CardBody>
							<VStack spacing={ 4 }>
								<Heading level={ 3 } size={ 16 }>
									{ card.title }
								</Heading>
								<Text as="p" variant="muted">
									{ card.body }
								</Text>
								<CheckList items={ card.features } />
							</VStack>
						</CardBody>
					</Card>
				) ) }
			</div>
		</VStack>
	);
}
