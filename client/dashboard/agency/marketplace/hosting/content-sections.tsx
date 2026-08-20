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
import enterpriseTestimonial1 from 'calypso/assets/images/a8c-for-agencies/hosting/enterprise-testimonial-1.webp';
import enterpriseTestimonial2 from 'calypso/assets/images/a8c-for-agencies/hosting/enterprise-testimonial-2.webp';
import premierTestimonial1 from 'calypso/assets/images/a8c-for-agencies/hosting/premier-testimonial-1.webp';
import premierTestimonial2 from 'calypso/assets/images/a8c-for-agencies/hosting/premier-testimonial-2.webp';
import standardTestimonial1 from 'calypso/assets/images/a8c-for-agencies/hosting/standard-testimonial-1.webp';
import standardTestimonial2 from 'calypso/assets/images/a8c-for-agencies/hosting/standard-testimonial-2.webp';
import { Card, CardBody } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import jetpackLogo from '../exclusive-offers/images/jetpack-descriptor.svg';
import { JETPACK_COMPLETE_FEATURES, testimonialsByBrand } from './mock-data';

const FEATURE_COLUMNS = ( brand: 'wpcom' | 'pressable' ) => [
	{
		title: __( 'Performance' ),
		features: [
			'Global edge caching',
			'Global CDN with 28+ locations',
			'High-frequency CPUs',
			'High-burst capacity',
			'Automated datacenter failover',
			'Extremely fast DNS with SSL',
			brand === 'pressable' ? '5 PHP workers w/ auto-scaling' : '10 PHP workers w/ auto-scaling',
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
			...( brand === 'wpcom' ? [ 'Free domain for one year' ] : [] ),
			'Smart redirects',
		],
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

export function Eyebrow( { children }: { children: React.ReactNode } ) {
	return (
		<Text variant="muted" size={ 11 } upperCase weight={ 500 }>
			{ children }
		</Text>
	);
}

export function CheckList( { items }: { items: string[] } ) {
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

export function IncludedFeatures( { brand }: { brand: 'wpcom' | 'pressable' } ) {
	return (
		<VStack spacing={ 4 }>
			<SectionHeader
				prefix={ <Eyebrow>{ __( 'World-class functionality' ) }</Eyebrow> }
				title={
					brand === 'pressable'
						? __( 'Included with every Pressable site' )
						: __( 'Included with every WordPress.com site' )
				}
				level={ 2 }
			/>
			<div className="marketplace-hosting__grid-4">
				{ FEATURE_COLUMNS( brand ).map( ( column ) => (
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

const TESTIMONIAL_AVATARS: Record< 'wpcom' | 'pressable' | 'vip', string[] > = {
	wpcom: [ standardTestimonial1, standardTestimonial2 ],
	pressable: [ premierTestimonial1, premierTestimonial2 ],
	vip: [ enterpriseTestimonial1, enterpriseTestimonial2 ],
};

const TESTIMONIAL_HEADINGS: Record< 'wpcom' | 'pressable' | 'vip', string > = {
	wpcom: __( 'Love for WordPress.com hosting' ),
	pressable: __( 'Love for Pressable hosting' ),
	vip: __( 'Love for VIP hosting' ),
};

export function Testimonials( { brand }: { brand: 'wpcom' | 'pressable' | 'vip' } ) {
	return (
		<VStack spacing={ 4 }>
			<SectionHeader
				prefix={ <Eyebrow>{ __( 'What agencies say' ) }</Eyebrow> }
				title={ TESTIMONIAL_HEADINGS[ brand ] }
				level={ 2 }
			/>
			<div className="marketplace-hosting__grid-2">
				{ testimonialsByBrand[ brand ].map( ( testimonial, index ) => (
					<Card key={ testimonial.name }>
						<CardBody>
							<VStack spacing={ 4 }>
								<Text as="p">{ testimonial.quote }</Text>
								<HStack spacing={ 3 } justify="flex-start" alignment="center">
									<img
										src={ TESTIMONIAL_AVATARS[ brand ][ index ] }
										alt={ testimonial.name }
										className="marketplace-hosting__avatar"
									/>
									<VStack spacing={ 1 }>
										<Text weight={ 600 }>{ testimonial.name }</Text>
										<Text variant="muted">{ testimonial.role }</Text>
										<ExternalLink href={ testimonial.linkUrl }>
											{ testimonial.linkLabel }
										</ExternalLink>
									</VStack>
								</HStack>
							</VStack>
						</CardBody>
					</Card>
				) ) }
			</div>
		</VStack>
	);
}

export function JetpackComplete() {
	return (
		<VStack spacing={ 4 }>
			<SectionHeader
				prefix={ <Eyebrow>{ __( 'Supercharge your clients’ sites' ) }</Eyebrow> }
				title={ __( 'Jetpack Complete included' ) }
				description={ __(
					'Every Pressable site comes with a free Jetpack Complete license — a $899/year/site value.'
				) }
				level={ 2 }
				decoration={ <img src={ jetpackLogo } alt="Jetpack" height={ 24 } /> }
			/>
			<Card>
				<CardBody>
					<div className="marketplace-hosting__includes">
						{ JETPACK_COMPLETE_FEATURES.map( ( feature ) => (
							<HStack key={ feature } spacing={ 2 } justify="flex-start" alignment="center">
								<Icon icon={ check } className="marketplace-hosting__check" />
								<Text>{ feature }</Text>
							</HStack>
						) ) }
						<HStack spacing={ 2 } justify="flex-start" alignment="center">
							<Icon icon={ check } className="marketplace-hosting__check" />
							<ExternalLink href="https://jetpack.com/complete/">{ __( 'And more' ) }</ExternalLink>
						</HStack>
					</div>
				</CardBody>
			</Card>
		</VStack>
	);
}

export function ClientRelationships() {
	return (
		<VStack spacing={ 4 }>
			<SectionHeader
				prefix={ <Eyebrow>{ __( 'How Automattic can help' ) }</Eyebrow> }
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
