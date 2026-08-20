import {
	Button,
	ExternalLink,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import cnnLogo from 'calypso/assets/images/logos/cnn.svg';
import metaLogo from 'calypso/assets/images/logos/meta.svg';
import newYorkPostLogo from 'calypso/assets/images/logos/new-york-post.svg';
import newsCorpLogo from 'calypso/assets/images/logos/news-corp.svg';
import salesforceLogo from 'calypso/assets/images/logos/salesforce.svg';
import slackLogo from 'calypso/assets/images/logos/slack.svg';
import spotifyLogo from 'calypso/assets/images/logos/spotify.svg';
import { Card, CardBody, CardDivider } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import vipLogo from '../exclusive-offers/images/vip-descriptor.svg';
import { CheckList } from './content-sections';
import { VIP_CAPABILITIES, VIP_PITCH_CAPABILITIES } from './mock-data';

const CLIENT_BRANDS = [
	{ name: 'Salesforce', logo: salesforceLogo },
	{ name: 'Meta', logo: metaLogo },
	{ name: 'Slack', logo: slackLogo },
	{ name: 'Spotify', logo: spotifyLogo },
	{ name: 'CNN', logo: cnnLogo },
	{ name: 'News Corp', logo: newsCorpLogo },
	{ name: 'New York Post', logo: newYorkPostLogo },
];

export default function VipContent() {
	return (
		<VStack spacing={ 4 }>
			<SectionHeader
				title={ __(
					'2. Deliver unmatched performance with the highest security standards on our enterprise platform'
				) }
				level={ 2 }
			/>
			<Card>
				<CardBody>
					<VStack spacing={ 5 }>
						<HStack spacing={ 3 } justify="flex-start" alignment="center">
							<img
								src={ vipLogo }
								alt="WordPress VIP"
								className="marketplace-hosting__brand-logo"
							/>
							<Text variant="muted">{ __( 'Enterprise WordPress' ) }</Text>
						</HStack>
						<Text as="p">
							{ __(
								'Combine the ease of WordPress with enterprise-grade security and scalability.'
							) }
						</Text>
						<HStack justify="flex-start" spacing={ 3 }>
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
						</HStack>

						<CardDivider />

						<VStack spacing={ 3 }>
							<Heading level={ 3 } size={ 16 }>
								{ __( 'The platform the biggest brands trust.' ) }
							</Heading>
							<Text variant="muted">
								{ createInterpolateElement(
									__(
										'Earn up to a 20% one-time commission on client referrals to WordPress VIP. <a>Full Terms</a>'
									),
									{
										a: (
											<ExternalLink href="https://automattic.com/for-agencies/program-incentives">
												{ /* children replaced by i18n */ }
											</ExternalLink>
										),
									}
								) }
							</Text>
							<CheckList items={ VIP_PITCH_CAPABILITIES } />
						</VStack>

						<div className="marketplace-hosting__brand-strip">
							{ CLIENT_BRANDS.map( ( brand ) => (
								<img key={ brand.name } src={ brand.logo } alt={ brand.name } />
							) ) }
						</div>
					</VStack>
				</CardBody>
			</Card>

			<SectionHeader
				title={ __( 'VIP capabilities' ) }
				description={ __(
					'Combine the ease of WordPress with enterprise-grade security and scalability.'
				) }
				level={ 2 }
			/>
			<Card>
				<CardBody>
					<div className="marketplace-hosting__includes">
						{ VIP_CAPABILITIES.map( ( capability ) => (
							<CheckList key={ capability } items={ [ capability ] } />
						) ) }
					</div>
				</CardBody>
			</Card>
		</VStack>
	);
}
