import { englishLocales, useLocale, localizeUrl } from '@automattic/i18n-utils';
import { Card, CardBody, Icon, ExternalLink } from '@wordpress/components';
import { hasTranslation } from '@wordpress/i18n';
import { chartBar, people, trendingUp } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { SectionContainer } from 'calypso/components/section';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import './style.scss';

type GrowYourAudienceCardProps = {
	ctaLabel: string;
	externalUrl?: boolean;
	icon: JSX.Element;
	text: string;
	title: string;
	tracksEventCta: string;
	url: string;
};

const GrowYourAudienceCard = ( {
	ctaLabel,
	externalUrl,
	icon,
	text,
	title,
	tracksEventCta,
	url,
}: GrowYourAudienceCardProps ) => {
	const onClick = () =>
		recordTracksEvent( 'calypso_subscriber_management_growth_cta_click', {
			cta: tracksEventCta,
		} );

	return (
		<Card className="grow-your-audience__card" size="small">
			<CardBody className="grow-your-audience__card-body">
				<h3 className="grow-your-audience__card-title">
					<Icon className="grow-your-audience__card-icon" icon={ icon } size={ 20 } />
					{ title }
				</h3>
				<p className="grow-your-audience__card-text">{ text }</p>
				{ externalUrl ? (
					<ExternalLink className="grow-your-audience__card-link" href={ url } onClick={ onClick }>
						{ ctaLabel }
					</ExternalLink>
				) : (
					<a className="grow-your-audience__card-link" href={ url } onClick={ onClick }>
						{ ctaLabel }
					</a>
				) }
			</CardBody>
		</Card>
	);
};

const GrowYourAudience = () => {
	const locale = useLocale();
	const translate = useTranslate();
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );

	const statsCardTranslated =
		englishLocales.includes( locale ) ||
		( hasTranslation( 'Explore your stats' ) &&
			hasTranslation(
				'Take a look at your stats and refine your content strategy for better engagement.'
			) &&
			hasTranslation( 'Check stats' ) );

	return (
		<SectionContainer className="grow-your-audience">
			<h2 className="grow-your-audience__title">{ translate( 'Grow your audience' ) }</h2>

			<div className="grow-your-audience__cards">
				{ statsCardTranslated ? (
					<GrowYourAudienceCard
						icon={ chartBar }
						text={ translate(
							'Take a look at your stats and refine your content strategy for better engagement.'
						) }
						title={ translate( 'Explore your stats' ) }
						tracksEventCta="stats"
						ctaLabel={ translate( 'Check stats' ) }
						url={ `/stats/subscribers/${ selectedSiteSlug }` }
					/>
				) : (
					<GrowYourAudienceCard
						icon={ chartBar }
						text={ translate(
							'Using a subscriber block is the first step to growing your audience.'
						) }
						title={ translate( 'Every visitor is a potential subscriber' ) }
						tracksEventCta="subscribe-block"
						ctaLabel={ translate( 'Learn more' ) }
						externalUrl
						url={ localizeUrl(
							'https://wordpress.com/support/wordpress-editor/blocks/subscribe-block/'
						) }
					/>
				) }

				<GrowYourAudienceCard
					icon={ trendingUp }
					text={ translate(
						'Allow your readers to support your work with paid subscriptions, gated content, or tips.'
					) }
					title={ translate( 'Start earning' ) }
					tracksEventCta="earn"
					ctaLabel={ translate( 'Learn more' ) }
					url={ `/earn/${ selectedSiteSlug ?? '' }` }
				/>

				<GrowYourAudienceCard
					icon={ people }
					text={ translate(
						'Create fresh content, publish regularly, and understand your audience with site stats.'
					) }
					title={ translate( 'Keep your readers engaged' ) }
					tracksEventCta="go-content-strategy"
					ctaLabel={ translate( 'Learn more' ) }
					externalUrl
					url="https://wordpress.com/go/content-blogging/how-to-start-a-successful-blog-that-earns-links-traffic-and-revenue/#creating-a-blog-content-strategy" // eslint-disable-line wpcalypso/i18n-unlocalized-url
				/>
			</div>
		</SectionContainer>
	);
};

export default GrowYourAudience;
