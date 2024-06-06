import { FEATURE_SFTP, getPlan, PLAN_BUSINESS } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Card, Dialog } from '@automattic/components';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import EligibilityWarnings from 'calypso/blocks/eligibility-warnings';
import CardHeading from 'calypso/components/card-heading';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { useSelector } from 'calypso/state';
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
	<Card className="dev-tools__card">
		<CardHeading>{ title }</CardHeading>
		<p>{ text }</p>
		{ translate( '{{supportLink}}Learn more{{/supportLink}}', {
			components: {
				supportLink: <InlineSupportLink supportContext={ supportContext } showIcon={ false } />,
			},
		} ) }
	</Card>
);

const DevTools = () => {
	const { searchParams } = new URL( document.location.toString() );
	const showActivationModal = searchParams.get( 'activate' ) !== null;
	const [ showEligibility, setShowEligibility ] = useState( showActivationModal );
	const siteId = useSelector( getSelectedSiteId );
	const { siteSlug, isSiteAtomic, hasSftpFeature } = useSelector( ( state ) => ( {
		siteSlug: getSiteSlug( state, siteId ) || '',
		isSiteAtomic: isSiteWpcomAtomic( state, siteId as number ),
		hasSftpFeature: siteHasFeature( state, siteId, FEATURE_SFTP ),
	} ) );
	// The ref is required to persist the value of redirect_to after renders
	const redirectUrl = useRef(
		searchParams.get( 'redirect_to' ) ?? hasSftpFeature
			? `/hosting-config/${ siteId }`
			: `/overview/${ siteId }`
	);
	const hasEnTranslation = useHasEnTranslation();

	const upgradeLink = `https://wordpress.com/checkout/${ encodeURIComponent( siteSlug ) }/business`;
	const promoCards = [
		{
			title: translate( 'Deployments' ),
			text: translate(
				'Automate updates from GitHub to streamline workflows, reduce errors, and enable faster deployments.'
			),
			supportContext: 'github-deployments',
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
			title: hasEnTranslation( 'Server Settings' )
				? translate( 'Server Settings' )
				: translate( 'Server Configuration' ),
			text: translate(
				"Access your site's database and tailor your server settings to your specific needs."
			),
			supportContext: 'hosting-configuration',
		},
	];

	const canSiteGoAtomic = ! isSiteAtomic && hasSftpFeature;
	const showActivationButton = canSiteGoAtomic;
	const handleTransfer = ( options: { geo_affinity?: string } ) => {
		const params = new URLSearchParams( {
			siteId: String( siteId ),
			redirect_to: redirectUrl.current,
			feature: FEATURE_SFTP,
			initiate_transfer_context: 'hosting',
			initiate_transfer_geo_affinity: options.geo_affinity || '',
		} );
		page( `/setup/transferring-hosted-site?${ params }` );
	};

	if ( isSiteAtomic ) {
		page.replace( redirectUrl.current );
		return;
	}

	const upgradeCtaCopy = hasEnTranslation(
		'Upgrade to the %(planName)s plan or higher to get access to all developer tools'
	)
		? // translators: %(planName)s is a plan name. E.g. Business plan.
		  translate(
				'Upgrade to the %(planName)s plan or higher to get access to all developer tools',
				{
					args: {
						planName: getPlan( PLAN_BUSINESS )?.getTitle() ?? '',
					},
				}
		  )
		: translate( 'Upgrade to the Creator plan or higher to get access to all developer tools' );

	return (
		<div className="dev-tools">
			<div className="dev-tools__hero">
				<h1>
					{ showActivationButton
						? translate( 'Activate all developer tools' )
						: translate( 'Unlock all developer tools' ) }
				</h1>
				<p>
					{ showActivationButton
						? translate(
								'Your plan includes all the developer tools listed below. Click "Activate now" to begin.'
						  )
						: upgradeCtaCopy }
				</p>
				{ showActivationButton ? (
					<>
						<Button
							variant="primary"
							className="dev-tools__button"
							onClick={ () => {
								if ( showActivationButton ) {
									return setShowEligibility( true );
								}
							} }
						>
							{ translate( 'Activate now' ) }
						</Button>

						<Dialog
							additionalClassNames="plugin-details-cta__dialog-content"
							additionalOverlayClassNames="plugin-details-cta__modal-overlay"
							isVisible={ showEligibility }
							onClose={ () => setShowEligibility( false ) }
							showCloseIcon
						>
							<EligibilityWarnings
								className="hosting__activating-warnings"
								onProceed={ handleTransfer }
								backUrl={ redirectUrl.current }
								showDataCenterPicker
								standaloneProceed
								currentContext="dev-tools"
							/>
						</Dialog>
					</>
				) : (
					<>
						<Button variant="primary" className="dev-tools__button" href={ upgradeLink }>
							{ translate( 'Upgrade now' ) }
						</Button>
					</>
				) }
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
