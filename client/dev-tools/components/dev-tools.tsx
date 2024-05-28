import { getPlan, PLAN_BUSINESS, FEATURE_INSTALL_PLUGINS } from '@automattic/calypso-products';
import { Card } from '@automattic/components';
import { translate } from 'i18n-calypso';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import CardHeading from 'calypso/components/card-heading';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { useSelector } from 'calypso/state';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import './style.scss';

type PromoCardProps = {
	title: string;
	text: string;
	supportContext: string;
};

const PromoCard = ( { title, text, supportContext }: PromoCardProps ) => (
	<Card className="dev-tools__card">
		<CardHeading>{ title }</CardHeading>
		<p>{ text }</p>
		<InlineSupportLink supportContext={ supportContext } showIcon={ false } />
	</Card>
);

const DevTools = () => {
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) ) || '';

	const promoCards = [
		{
			title: translate( 'Hosting Configuration' ),
			text: translate(
				"Access your site's database and tailor your server settings to your specific needs."
			),
			supportContext: 'hosting-configuration',
		},
		{
			title: translate( 'Monitoring' ),
			text: translate(
				"Proactively monitor your site's performance, including requests per minute and average response time."
			),
			supportContext: 'site-monitoring-metrics',
		},
		{
			title: translate( 'PHP Logs' ),
			text: translate( 'View and download PHP error logs to diagnose and resolve issues quickly.' ),
			supportContext: 'site-monitoring-logs',
		},
		{
			title: translate( 'Server Logs' ),
			text: translate(
				'Gain full visibility into server activity, helping you manage traffic and spot security issues early.'
			),
			supportContext: 'site-monitoring-logs',
		},
		{
			title: translate( 'GitHub Deployments' ),
			text: translate(
				'Automate updates from GitHub to streamline workflows, reduce errors, and enable faster deployments.'
			),
			supportContext: 'github-deployments',
		},
	];
	return (
		<div className="dev-tools">
			<div className="dev-tools__hero">
				<h1> { translate( 'Unlock all developer tools' ) }</h1>
				<UpsellNudge
					event="calypso_dev_tools_nudge"
					secondaryCallToAction={ translate( 'Browse plugins' ) }
					secondaryHref={ `/plugins/${ siteSlug }` }
					showIcon
					feature={ FEATURE_INSTALL_PLUGINS }
					plan={ PLAN_BUSINESS }
					callToAction={ translate( 'Upgrade now' ) }
					primaryButton
					title={ translate( 'Upgrade to the %(planName)s plan for access to all developer tools', {
						args: { planName: getPlan( PLAN_BUSINESS )?.getTitle() ?? '' },
					} ) }
					description={ translate(
						'Get access to over 50,000 plugins, advanced hosting configuration, site monitoring, and more.'
					) }
					isOneClickCheckoutEnabled
				/>
			</div>
			<div className="dev-tools__cards">
				{ promoCards.map( ( card ) => (
					<PromoCard
						title={ card.title }
						text={ card.text }
						supportContext={ card.supportContext }
					/>
				) ) }
			</div>
		</div>
	);
};

export default DevTools;
