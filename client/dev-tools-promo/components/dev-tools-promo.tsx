import { FEATURE_SFTP } from '@automattic/calypso-products';
import { Card } from '@automattic/components';
import { Button } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import CardHeading from 'calypso/components/card-heading';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { useSelector } from 'calypso/state';
import isAutomatedTransferActive from 'calypso/state/automated-transfer/selectors/is-automated-transfer-active';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import './style.scss';

type PromoCardProps = {
	title: string;
	text: string;
	supportContext: string;
};

const PromoCard = ( { title, text, supportContext }: PromoCardProps ) => (
	<Card className="dev-tools-promo__card">
		<CardHeading>{ title }</CardHeading>
		<p>{ text }</p>
		{ translate( '{{supportLink}}Learn more{{/supportLink}}', {
			components: {
				supportLink: <InlineSupportLink supportContext={ supportContext } showIcon={ false } />,
			},
		} ) }
	</Card>
);

const DevToolsPromo = () => {
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) ) || '';

	const upgradeLink = `https://wordpress.com/checkout/${ encodeURIComponent( siteSlug ) }/business`;
	const pluginsLink = `https://wordpress.com/plugins/${ encodeURIComponent( siteSlug ) }`;
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

	const isSiteAtomic = useSelector( ( state ) => isSiteWpcomAtomic( state, siteId as number ) );
	const hasSftpFeature = useSelector( ( state ) => siteHasFeature( state, siteId, FEATURE_SFTP ) );
	const canSiteGoAtomic = ! isSiteAtomic && hasSftpFeature;
	const hasTransfer = useSelector( ( state ) =>
		isAutomatedTransferActive( state, siteId as number )
	);
	const showHostingActivationButton = canSiteGoAtomic && ! hasTransfer;

	return (
		<div className="dev-tools-promo">
			<div className="dev-tools-promo__hero">
				<h1>
					{ showHostingActivationButton
						? translate( 'Activate hosting configuration' )
						: translate( 'Unlock all developer tools' ) }
				</h1>
				<p>
					{ showHostingActivationButton
						? translate(
								'Your plan includes all the developer tools listed below. Click "Activate Now" to begin.'
						  )
						: translate(
								'Upgrade to the Creator plan or higher to get access to all developer tools'
						  ) }
				</p>
				{ showHostingActivationButton ? (
					<Button variant="primary" className="dev-tools-promo__button" href={ upgradeLink }>
						{ translate( 'Activate now' ) }
					</Button>
				) : (
					<>
						<Button variant="secondary" className="dev-tools-promo__button" href={ pluginsLink }>
							{ translate( 'Browse plugins' ) }
						</Button>
						<Button variant="primary" className="dev-tools-promo__button" href={ upgradeLink }>
							{ translate( 'Upgrade now' ) }
						</Button>
					</>
				) }
			</div>
			<div className="dev-tools-promo__cards">
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

export default DevToolsPromo;
