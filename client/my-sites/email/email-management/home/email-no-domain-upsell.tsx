import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import googleWorkspaceIcon from 'calypso/assets/images/email-providers/google-workspace/icon.svg';
import poweredByTitanLogo from 'calypso/assets/images/email-providers/titan/powered-by-titan-caps.svg';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { getGoogleMailServiceFamily } from 'calypso/lib/gsuite';
import { getTitanProductName } from 'calypso/lib/titan';
import { recordEmailUpsellTracksEvent } from 'calypso/my-sites/email/email-management/home/utils';
import { getGoogleAppLogos } from 'calypso/my-sites/email/email-provider-features/list';
import EmailProvidersStackedCard from 'calypso/my-sites/email/email-providers-comparison/stacked/email-provider-stacked-card';
import type { SiteDetails } from '@automattic/data-stores';
import type { TranslateResult } from 'i18n-calypso';

import './email-no-domain-upsell.scss';

type EmailNoDomainUpsellProps = {
	selectedSite: SiteDetails;
	source: string;
};

type Benefit = {
	key: string;
	icon: string;
	title: TranslateResult;
	description: TranslateResult;
};

const EmailNoDomainUpsell = ( { selectedSite, source }: EmailNoDomainUpsellProps ) => {
	const translate = useTranslate();

	const upgradeUrl = `/plans/${ selectedSite.slug }`;

	const handleUpgradeClick = () => {
		recordEmailUpsellTracksEvent( source || 'email', 'plan' );
	};

	const upgradeButton = (
		<Button primary href={ upgradeUrl } onClick={ handleUpgradeClick }>
			{ translate( 'Upgrade to add email' ) }
		</Button>
	);

	const googleAppLogos = getGoogleAppLogos();
	const googleFormFields = (
		<>
			<div className="email-provider-stacked-features__logos email-no-domain-upsell__google-logos">
				{ googleAppLogos.map(
					(
						{ image, imageAltText, title }: { image: string; imageAltText: string; title: string },
						index: number
					) => (
						<img alt={ imageAltText } key={ index } src={ image } title={ title } />
					)
				) }
			</div>
			{ upgradeButton }
		</>
	);

	const benefits: Benefit[] = [
		{
			key: 'brand',
			icon: 'mail',
			title: translate( 'Look professional' ),
			description: translate(
				'Use a custom email address that matches your domain and your brand.'
			),
		},
		{
			key: 'storage',
			icon: 'cloud',
			title: translate( 'Plenty of storage' ),
			description: translate( '30GB per mailbox for messages, attachments, and shared files.' ),
		},
		{
			key: 'security',
			icon: 'lock',
			title: translate( 'Secure and ad-free' ),
			description: translate(
				'Industry-leading anti-spam, privacy, and zero ads on every message.'
			),
		},
		{
			key: 'devices',
			icon: 'phone',
			title: translate( 'Works on every device' ),
			description: translate(
				'Access your inbox from desktop, mobile, or the web — no extra setup.'
			),
		},
	];

	return (
		<div className="email-no-domain-upsell">
			<header className="email-no-domain-upsell__hero">
				<h1 className="email-no-domain-upsell__hero-title">
					{ translate( 'Get email that matches your brand' ) }
				</h1>
				<p className="email-no-domain-upsell__hero-subtitle">
					{ translate(
						'A professional email address builds trust, keeps your business top of mind, and helps customers reach you. Upgrade your plan to unlock it.'
					) }
				</p>

				<ul className="email-no-domain-upsell__benefits">
					{ benefits.map( ( benefit ) => (
						<li key={ benefit.key } className="email-no-domain-upsell__benefit">
							<Gridicon
								className="email-no-domain-upsell__benefit-icon"
								icon={ benefit.icon }
								size={ 24 }
							/>
							<h3 className="email-no-domain-upsell__benefit-title">{ benefit.title }</h3>
							<p className="email-no-domain-upsell__benefit-description">{ benefit.description }</p>
						</li>
					) ) }
				</ul>
			</header>

			<div className="email-no-domain-upsell__providers">
				<h2 className="email-no-domain-upsell__providers-heading">
					{ translate( 'Pick an email solution' ) }
				</h2>
				<p className="email-no-domain-upsell__providers-subheading">
					{ translate(
						'Both options work with a custom domain you’ll set up after upgrading.{{br/}}Additional service fees for the email offerings will apply.',
						{ components: { br: <br /> } }
					) }
				</p>

				<EmailProvidersStackedCard
					className="professional-email-card"
					description={ translate(
						'Integrated email solution with powerful features. Manage your email and more on any device.'
					) }
					detailsExpanded
					expandButtonLabel={ translate( 'Select' ) }
					features={ [
						translate( 'Send and receive from your custom domain' ),
						translate( '30GB storage' ),
						translate( 'Email, calendars, and contacts' ),
						translate( '24/7 support via email' ),
					] }
					footerBadge={
						<img
							src={ poweredByTitanLogo }
							alt={ translate( 'Powered by Titan', { textOnly: true } ) }
						/>
					}
					formFields={ upgradeButton }
					logo={
						<Gridicon
							className="professional-email-card__logo"
							icon="my-sites"
							aria-hidden="true"
						/>
					}
					productName={ getTitanProductName() }
					providerKey="titan"
					showExpandButton={ false }
				/>

				<EmailProvidersStackedCard
					className="google-workspace-card"
					description={ translate(
						'Business email with Gmail. Includes other collaboration and productivity tools from Google.'
					) }
					detailsExpanded
					expandButtonLabel={ translate( 'Select' ) }
					features={ [
						translate( 'Send and receive from your custom domain' ),
						translate( '30GB storage' ),
						translate( 'Email, calendars, and contacts' ),
						translate( 'Video calls, docs, spreadsheets, and more' ),
						translate( 'Real-time collaboration' ),
						translate( 'Store and share files in the cloud' ),
						translate( '24/7 support via email' ),
					] }
					formFields={ googleFormFields }
					logo={ { path: googleWorkspaceIcon, className: 'google-workspace-icon' } }
					productName={ getGoogleMailServiceFamily() }
					providerKey="google"
					showExpandButton={ false }
				/>
			</div>

			<TrackComponentView
				eventName="calypso_email_management_no_domain"
				eventProperties={ {
					context: 'free-plan-upsell',
					source: source || 'email',
				} }
			/>
		</div>
	);
};

export default EmailNoDomainUpsell;
