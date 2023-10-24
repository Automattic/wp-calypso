import { Card, CardBody, Icon, ExternalLink } from '@wordpress/components';
import { chartBar, people, trendingUp } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { SectionContainer } from 'calypso/components/section';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getEarnPageUrl } from '../../helpers';
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
	url,
}: GrowYourAudienceCardProps ) => (
	<Card className="grow-your-audience__card" size="small">
		<CardBody className="grow-your-audience__card-body">
			<h3 className="grow-your-audience__card-title">
				<Icon className="grow-your-audience__card-icon" icon={ icon } size={ 20 } />
				{ title }
			</h3>
			<p className="grow-your-audience__card-text">{ text }</p>
			{ externalUrl ? (
				<ExternalLink className="grow-your-audience__card-link" href={ url }>
					{ ctaLabel }
				</ExternalLink>
			) : (
				<a className="grow-your-audience__card-link" href={ url }>
					{ ctaLabel }
				</a>
			) }
		</CardBody>
	</Card>
);

const GrowYourAudience = () => {
	const translate = useTranslate();
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );

	return (
		<SectionContainer className="grow-your-audience">
			<h2 className="grow-your-audience__title">{ translate( 'Grow your audience' ) }</h2>

			<div className="grow-your-audience__cards">
				<GrowYourAudienceCard
					icon={ chartBar }
					text={ translate(
						'Take a look at your stats and refine your content strategy for better engagement.'
					) }
					title={ translate( 'Explore your stats' ) }
					ctaLabel={ translate( 'Check stats' ) }
					url={ `/stats/subscribers/${ selectedSiteSlug }` }
				/>

				<GrowYourAudienceCard
					icon={ people }
					text={ translate(
						'Create fresh content, publish regularly, and understand your audience with site stats.'
					) }
					title={ translate( 'Keep your readers engaged' ) }
					ctaLabel={ translate( 'Learn more' ) }
					externalUrl
					url="https://wordpress.com/go/content-blogging/how-to-start-a-successful-blog-that-earns-links-traffic-and-revenue/#creating-a-blog-content-strategy" // eslint-disable-line wpcalypso/i18n-unlocalized-url
				/>

				<GrowYourAudienceCard
					icon={ trendingUp }
					text={ translate(
						'Allow your readers to support your work with paid subscriptions, gated content, or tips.'
					) }
					title={ translate( 'Start earning' ) }
					ctaLabel={ translate( 'Learn more' ) }
					url={ getEarnPageUrl( selectedSiteSlug ) }
				/>
			</div>
		</SectionContainer>
	);
};

export default GrowYourAudience;
