import { formatNumber } from '@automattic/number-formatters';
import {
	Button,
	ExternalLink,
	__experimentalDivider as Divider,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import cnnLogo from 'calypso/assets/images/logos/cnn.svg';
import metaLogo from 'calypso/assets/images/logos/meta.svg';
import newsCorpLogo from 'calypso/assets/images/logos/news-corp.svg';
import salesforceLogo from 'calypso/assets/images/logos/salesforce.svg';
import slackLogo from 'calypso/assets/images/logos/slack.svg';
import spotifyLogo from 'calypso/assets/images/logos/spotify.svg';
import { useAnalytics } from '../../../app/analytics';
import { ButtonStack } from '../../../components/button-stack';
import { Card, CardBody, CardDivider, CardHeader } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import { a4aLink } from '../../../utils/link';
import vipDescriptor from '../exclusive-offers/images/vip-descriptor.svg';
import { BrandMark, CheckList, Testimonials, VipCapabilities } from './content-sections';

const VIP_PARTNER_OPPORTUNITY_COMMISSION_PERCENTAGE = 20;
const VIP_DEMO_URL =
	'https://wpvip.com/get-a-demo/?utm_source=partner&utm_medium=referral&utm_campaign=a4a';
const VIP_PROGRAM_INCENTIVES_URL = 'https://automattic.com/for-agencies/program-incentives';

const CLIENT_LOGOS = [
	{ name: 'Salesforce', logo: salesforceLogo },
	{ name: 'Meta', logo: metaLogo },
	{ name: 'Slack', logo: slackLogo },
	{ name: 'Spotify', logo: spotifyLogo },
	{ name: 'CNN', logo: cnnLogo },
	{ name: 'News Corp', logo: newsCorpLogo },
];

/** VIP is sold through a demo or a referral, so the rail has no price. */
export default function VipSection( { isReferralMode }: { isReferralMode: boolean } ) {
	const { recordTracksEvent } = useAnalytics();

	const requestDemoButton = ( variant: 'primary' | 'secondary' ) => (
		<Button
			variant={ variant }
			__next40pxDefaultSize
			href={ VIP_DEMO_URL }
			target="_blank"
			rel="noreferrer"
			onClick={ () =>
				recordTracksEvent( 'calypso_a4a_marketplace_hosting_enterprise_request_demo_click' )
			}
		>
			{ __( 'Request a demo ↗' ) }
		</Button>
	);

	// TODO: The VIP referral form is still the classic page.
	const referClientButton = ( variant: 'primary' | 'secondary' ) => (
		<Button
			variant={ variant }
			__next40pxDefaultSize
			href={ a4aLink( '/marketplace/hosting/refer-enterprise-hosting' ) }
			onClick={ () =>
				recordTracksEvent( 'calypso_a4a_marketplace_hosting_enterprise_refer_client_click' )
			}
		>
			{ __( 'Refer your client to VIP hosting' ) }
		</Button>
	);

	return (
		<div className="dashboard-marketplace-hosting__layout">
			<VStack spacing={ 8 } justify="flex-start">
				<Card>
					<CardHeader>
						<SectionHeader
							className="dashboard-marketplace-hosting__card-header"
							level={ 3 }
							title={ __(
								'Deliver unmatched performance with the highest security standards on our enterprise platform'
							) }
							description={
								isReferralMode
									? sprintf(
											/* translators: %d is the commission percentage. */
											__(
												'Successfully refer your client to WordPress VIP and you’ll earn up to a %d%% one-time commission'
											),
											VIP_PARTNER_OPPORTUNITY_COMMISSION_PERCENTAGE
									  )
									: __(
											'Combine the ease of WordPress with enterprise-grade security and scalability.'
									  )
							}
							decoration={ <BrandMark src={ vipDescriptor } /> }
						/>
					</CardHeader>
					<CardBody>
						<VStack spacing={ 5 }>
							<VStack spacing={ 3 }>
								<Heading level={ 4 } size={ 16 }>
									{ __( 'The platform the biggest brands trust.' ) }
								</Heading>
								<CheckList
									items={ [
										__( 'Unmatched flexibility to build a customized web experience' ),
										__( 'Tools to increase customer engagement' ),
										__(
											'Scalability to ensure top-notch site performance during campaigns or events'
										),
									] }
								/>
							</VStack>
							<div className="dashboard-marketplace-hosting__logos">
								{ CLIENT_LOGOS.map( ( client ) => (
									<div key={ client.name } className="dashboard-marketplace-hosting__logo">
										<img src={ client.logo } alt={ client.name } />
									</div>
								) ) }
							</div>
						</VStack>
					</CardBody>
				</Card>
				<VipCapabilities />
				<Divider style={ { color: 'var(--dashboard-overview__divider-color)' } } />
				<Testimonials brand="vip" />
			</VStack>
			<div className="dashboard-marketplace-hosting__rail">
				<Card>
					<CardHeader>
						<SectionHeader level={ 3 } title={ __( 'Enterprise WordPress' ) } />
					</CardHeader>
					<CardBody>
						<VStack spacing={ 4 } alignment="stretch">
							<img
								src={ vipDescriptor }
								alt="WordPress VIP"
								className="dashboard-marketplace-hosting__brand-logo"
							/>
							<ButtonStack justify="flex-start" expanded={ false } wrap>
								{ isReferralMode ? (
									<>
										{ referClientButton( 'primary' ) }
										{ requestDemoButton( 'secondary' ) }
									</>
								) : (
									<>
										{ requestDemoButton( 'primary' ) }
										{ referClientButton( 'secondary' ) }
									</>
								) }
							</ButtonStack>
							<CardDivider />
							<Text variant="muted">
								{ createInterpolateElement(
									/* translators: <percentage /> is the commission percentage, e.g. 20%. */
									__(
										'Earn up to a <percentage /> one-time commission on client referrals to WordPress VIP. <a>Full Terms</a>'
									),
									{
										percentage: (
											<>
												{ formatNumber( VIP_PARTNER_OPPORTUNITY_COMMISSION_PERCENTAGE / 100, {
													numberFormatOptions: { style: 'percent' },
												} ) }
											</>
										),
										a: <ExternalLink href={ VIP_PROGRAM_INCENTIVES_URL } children={ null } />,
									}
								) }
							</Text>
						</VStack>
					</CardBody>
				</Card>
			</div>
		</div>
	);
}
