import {
	Button,
	ExternalLink,
	__experimentalDivider as Divider,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import cnnLogo from 'calypso/assets/images/logos/cnn.svg';
import metaLogo from 'calypso/assets/images/logos/meta.svg';
import newsCorpLogo from 'calypso/assets/images/logos/news-corp.svg';
import salesforceLogo from 'calypso/assets/images/logos/salesforce.svg';
import slackLogo from 'calypso/assets/images/logos/slack.svg';
import spotifyLogo from 'calypso/assets/images/logos/spotify.svg';
import { ButtonStack } from '../../../components/button-stack';
import { Card, CardBody, CardDivider, CardHeader } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import vipLogo from '../exclusive-offers/images/vip-descriptor.svg';
import { CheckGrid, CheckList, Testimonials } from './content-sections';
import { brandBlurb, tabLineMark, VIP_CAPABILITIES, VIP_PITCH_CAPABILITIES } from './mock-data';

const CLIENT_BRANDS = [
	{ name: 'Salesforce', logo: salesforceLogo },
	{ name: 'Meta', logo: metaLogo },
	{ name: 'Slack', logo: slackLogo },
	{ name: 'Spotify', logo: spotifyLogo },
	{ name: 'CNN', logo: cnnLogo },
	{ name: 'News Corp', logo: newsCorpLogo },
];

function VipPitchCard() {
	return (
		<Card>
			<CardHeader>
				<SectionHeader
					className="marketplace-hosting__card-header"
					title={ __(
						'Deliver unmatched performance with the highest security standards on our enterprise platform'
					) }
					description={ brandBlurb( 'vip' ) }
					decoration={ tabLineMark( vipLogo ) }
					level={ 3 }
				/>
			</CardHeader>
			<CardBody>
				<VStack spacing={ 5 }>
					<VStack spacing={ 3 }>
						<Heading level={ 3 } size={ 16 }>
							{ __( 'The platform the biggest brands trust.' ) }
						</Heading>
						<CheckList items={ VIP_PITCH_CAPABILITIES } />
					</VStack>

					<div className="marketplace-hosting__brand-strip">
						{ CLIENT_BRANDS.map( ( brand ) => (
							<div key={ brand.name } className="marketplace-hosting__brand-cell">
								<img src={ brand.logo } alt={ brand.name } />
							</div>
						) ) }
					</div>
				</VStack>
			</CardBody>
		</Card>
	);
}

function VipCapabilitiesCard() {
	return (
		<Card>
			<CardHeader>
				<SectionHeader
					title={ __( 'VIP capabilities' ) }
					description={ __(
						'Combine the ease of WordPress with enterprise-grade security and scalability.'
					) }
					level={ 3 }
				/>
			</CardHeader>
			<CardBody>
				<CheckGrid items={ VIP_CAPABILITIES } columns={ 3 } />
			</CardBody>
		</Card>
	);
}

function VipRailCard() {
	return (
		<Card>
			<CardHeader>
				<SectionHeader level={ 3 } title={ __( 'Enterprise WordPress' ) } />
			</CardHeader>
			<CardBody>
				<VStack spacing={ 4 }>
					<img src={ vipLogo } alt="WordPress VIP" className="marketplace-hosting__brand-logo" />
					<ButtonStack justify="flex-start" expanded={ false } wrap>
						<Button
							variant="primary"
							__next40pxDefaultSize
							href="https://wpvip.com/get-a-demo/?utm_source=partner&utm_medium=referral&utm_campaign=a4a"
							target="_blank"
							rel="noreferrer"
						>
							{ __( 'Request a demo ↗' ) }
						</Button>
						<Button variant="secondary" __next40pxDefaultSize>
							{ __( 'Refer your client to VIP hosting' ) }
						</Button>
					</ButtonStack>
					<CardDivider />
					<Text variant="muted">
						{ createInterpolateElement(
							__(
								'Earn up to a 20% one-time commission on client referrals to WordPress VIP. <a>Full Terms</a>'
							),
							{
								a: (
									<ExternalLink
										href="https://automattic.com/for-agencies/program-incentives"
										children={ null }
									/>
								),
							}
						) }
					</Text>
				</VStack>
			</CardBody>
		</Card>
	);
}

export default function VipContent() {
	return (
		<div className="marketplace-hosting__layout">
			<VStack spacing={ 8 } justify="flex-start">
				<VipPitchCard />
				<VipCapabilitiesCard />
				<Divider
					orientation="horizontal"
					style={ { color: 'var(--dashboard-overview__divider-color)' } }
				/>
				<Testimonials brand="vip" />
			</VStack>
			<div className="marketplace-hosting__rail">
				<VipRailCard />
			</div>
		</div>
	);
}
