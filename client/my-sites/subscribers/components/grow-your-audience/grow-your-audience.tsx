import { Card, CardBody, Icon, ExternalLink } from '@wordpress/components';
import { chartBar, people, trendingUp } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { SectionContainer } from 'calypso/components/section';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { useSelector } from 'calypso/state';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import { getSiteOption } from 'calypso/state/sites/selectors';
import getSiteAdminUrl from 'calypso/state/sites/selectors/get-site-admin-url';
import { getSelectedSiteSlug, getSelectedSiteId } from 'calypso/state/ui/selectors';
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
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const siteAdminUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId ) );
	const isWPCOMSite = useSelector( ( state ) => getIsSiteWPCOM( state, siteId ) );
	const isAdminInterfaceWPAdmin = useSelector(
		( state ) => getSiteOption( state, siteId, 'wpcom_admin_interface' ) === 'wp-admin'
	);
	const isClassicEarlyRelease = !! useSelector( ( state ) =>
		getSiteOption( state, siteId, 'wpcom_classic_early_release' )
	);
	const globalSiteEnabled = isAdminInterfaceWPAdmin && isClassicEarlyRelease;

	const statsUrl =
		! isWPCOMSite || globalSiteEnabled
			? `${ siteAdminUrl }admin.php?page=stats#!/stats/subscribers/${ selectedSiteSlug }`
			: `https://wordpress.com/stats/subscribers/${ selectedSiteSlug }`;

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
					tracksEventCta="stats"
					ctaLabel={ translate( 'Check stats' ) }
					url={ statsUrl }
				/>
				{ isWPCOMSite && (
					<>
						<GrowYourAudienceCard
							icon={ trendingUp }
							text={ translate(
								'Allow your readers to support your work with paid subscriptions, gated content, or tips.'
							) }
							title={ translate( 'Start earning' ) }
							tracksEventCta="earn"
							ctaLabel={ translate( 'Learn more' ) }
							url={
								isJetpackCloud()
									? `/monetize/${ selectedSiteSlug ?? '' }`
									: `/earn/${ selectedSiteSlug ?? '' }`
							}
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
					</>
				) }
			</div>
		</SectionContainer>
	);
};

export default GrowYourAudience;
