import { localizeUrl } from '@automattic/i18n-utils';
import { Card, CardBody, Icon } from '@wordpress/components';
import { chartBar, people, trendingUp } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { SectionContainer } from 'calypso/components/section';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getEarnPageUrl } from '../../helpers';
import './style.scss';

type GrowYourAudienceCardProps = {
	icon: JSX.Element;
	text: string;
	title: string;
	tracksEventCta: string;
	url: string;
};

const GrowYourAudienceCard = ( {
	icon,
	text,
	title,
	tracksEventCta,
	url,
}: GrowYourAudienceCardProps ) => {
	const translate = useTranslate();

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
				<a
					className="grow-your-audience__card-link"
					href={ url }
					onClick={ onClick }
					target="_blank"
					rel="noreferrer"
				>
					{ translate( 'Learn more' ) }
				</a>
			</CardBody>
		</Card>
	);
};

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
						'Using a subscriber block is the first step to growing your audience.'
					) }
					title={ translate( 'Every visitor is a potential subscriber' ) }
					tracksEventCta="subscribe-block"
					url={ localizeUrl(
						'https://wordpress.com/support/wordpress-editor/blocks/subscribe-block/'
					) }
				/>

				<GrowYourAudienceCard
					icon={ people }
					text={ translate(
						'Create fresh content, publish regularly, and understand your audience with site stats.'
					) }
					title={ translate( 'Keep your readers engaged' ) }
					tracksEventCta="go-content-strategy"
					url="https://wordpress.com/go/content-blogging/how-to-start-a-successful-blog-that-earns-links-traffic-and-revenue/#creating-a-blog-content-strategy" // eslint-disable-line wpcalypso/i18n-unlocalized-url
				/>

				<GrowYourAudienceCard
					icon={ trendingUp }
					text={ translate(
						'Allow your readers to support your work with paid subscriptions, gated content, or tips.'
					) }
					title={ translate( 'Start earning' ) }
					tracksEventCta="earn"
					url={ getEarnPageUrl( selectedSiteSlug ) }
				/>
			</div>
		</SectionContainer>
	);
};

export default GrowYourAudience;
