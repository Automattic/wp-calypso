import { JetpackLogo } from '@automattic/components/src/logos/jetpack-logo';
import {
	ExternalLink,
	Icon,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { check, code, lockOutline, plus, trendingUp } from '@wordpress/icons';
import enterpriseTestimonial1 from 'calypso/assets/images/a8c-for-agencies/hosting/enterprise-testimonial-1.webp';
import enterpriseTestimonial2 from 'calypso/assets/images/a8c-for-agencies/hosting/enterprise-testimonial-2.webp';
import premierTestimonial1 from 'calypso/assets/images/a8c-for-agencies/hosting/premier-testimonial-1.webp';
import premierTestimonial2 from 'calypso/assets/images/a8c-for-agencies/hosting/premier-testimonial-2.webp';
import standardTestimonial1 from 'calypso/assets/images/a8c-for-agencies/hosting/standard-testimonial-1.webp';
import standardTestimonial2 from 'calypso/assets/images/a8c-for-agencies/hosting/standard-testimonial-2.webp';
import { Card, CardBody } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import { JETPACK_COMPLETE_FEATURES, testimonialsByBrand } from './mock-data';

const FEATURE_COLUMNS = ( brand: 'wpcom' | 'pressable' ) => [
	{
		icon: trendingUp,
		title: __( 'Performance' ),
		features: [
			'High-frequency CPUs',
			'Auto-scaling PHP workers',
			'Automated datacenter failover',
			'Uptime monitoring',
		],
	},
	{
		icon: lockOutline,
		title: __( 'Security' ),
		features: [
			'DDoS protection',
			'Web application firewall',
			'Malware detection & removal',
			'Isolated site infrastructure',
		],
	},
	{
		icon: code,
		title: __( 'Developer tools' ),
		features: [
			'WP-CLI access',
			'SSH/SFTP access',
			'GitHub deployments',
			'Local development environment',
		],
	},
	{
		icon: plus,
		title: __( 'Site management' ),
		features: [
			'Free managed migrations',
			'Multi-site management',
			'Site analytics',
			...( brand === 'wpcom' ? [ 'Free domain for one year' ] : [ 'Smart redirects' ] ),
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
				title={
					brand === 'pressable'
						? __( 'More Pressable features' )
						: __( 'More WordPress.com features' )
				}
				level={ 2 }
			/>
			<div className="marketplace-hosting__grid-4">
				{ FEATURE_COLUMNS( brand ).map( ( column ) => (
					<Card key={ column.title }>
						<CardBody>
							<VStack spacing={ 4 }>
								<HStack spacing={ 2 } alignment="center" justify="flex-start">
									<Icon className="marketplace-hosting__feature-icon" icon={ column.icon } />
									<Text variant="muted" lineHeight="16px" size={ 11 } weight={ 500 } upperCase>
										{ column.title }
									</Text>
								</HStack>
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

export function Testimonials( { brand }: { brand: 'wpcom' | 'pressable' | 'vip' } ) {
	return (
		<VStack spacing={ 4 }>
			<SectionHeader title={ __( 'What agencies say' ) } level={ 2 } />
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
	const midpoint = Math.ceil( JETPACK_COMPLETE_FEATURES.length / 2 );

	return (
		<VStack spacing={ 4 }>
			<SectionHeader
				title={ __( 'Jetpack Complete included' ) }
				description={ __(
					'Every Pressable site comes with a free Jetpack Complete license — a $899/year/site value.'
				) }
				level={ 2 }
				decoration={ <JetpackLogo size={ 24 } /> }
			/>
			<div className="marketplace-hosting__grid-2">
				<Card>
					<CardBody>
						<CheckList items={ JETPACK_COMPLETE_FEATURES.slice( 0, midpoint ) } />
					</CardBody>
				</Card>
				<Card>
					<CardBody>
						<VStack spacing={ 2 }>
							<CheckList items={ JETPACK_COMPLETE_FEATURES.slice( midpoint ) } />
							<HStack spacing={ 2 } justify="flex-start" alignment="center">
								<Icon icon={ check } className="marketplace-hosting__check" />
								<ExternalLink href="https://jetpack.com/complete/">
									{ __( 'And more' ) }
								</ExternalLink>
							</HStack>
						</VStack>
					</CardBody>
				</Card>
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
