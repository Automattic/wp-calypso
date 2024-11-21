import { FEATURE_SFTP, getPlan, PLAN_BUSINESS } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { Spinner } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { useRef, useEffect } from 'react';
import { HostingCard, HostingCardGrid } from 'calypso/components/hosting-card';
import { HostingHero, HostingHeroButton } from 'calypso/components/hosting-hero';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { useSiteTransferStatusQuery } from 'calypso/landing/stepper/hooks/use-site-transfer/query';
import HostingActivationButton from 'calypso/sites/hosting-features/components/hosting-activation-button';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { transferStates } from 'calypso/state/atomic-transfer/constants';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

type PromoCardProps = {
	title: string;
	text: string;
	supportContext: string;
};

const PromoCard = ( { title, text, supportContext }: PromoCardProps ) => (
	<HostingCard inGrid className="hosting-features__card" title={ title }>
		<p>{ text }</p>
		{ translate( '{{supportLink}}Learn more{{/supportLink}}', {
			components: {
				supportLink: <InlineSupportLink supportContext={ supportContext } showIcon={ false } />,
			},
		} ) }
	</HostingCard>
);

const HostingFeatures = () => {
	const dispatch = useDispatch();
	const { searchParams } = new URL( document.location.toString() );
	const siteId = useSelector( getSelectedSiteId );
	const { siteSlug, isSiteAtomic, hasSftpFeature, isPlanExpired } = useSelector( ( state ) => ( {
		siteSlug: getSiteSlug( state, siteId ) || '',
		isSiteAtomic: isSiteWpcomAtomic( state, siteId as number ),
		hasSftpFeature: siteHasFeature( state, siteId, FEATURE_SFTP ),
		isPlanExpired: !! getSelectedSite( state )?.plan?.expired,
	} ) );
	// The ref is required to persist the value of redirect_to after renders
	const redirectToRef = useRef( searchParams.get( 'redirect_to' ) );

	const redirectUrl =
		redirectToRef.current ?? hasSftpFeature
			? `/hosting-config/${ siteId }`
			: `/overview/${ siteId }`;

	const hasEnTranslation = useHasEnTranslation();

	const { data: siteTransferData } = useSiteTransferStatusQuery( siteId || undefined, {
		refetchIntervalInBackground: true,
	} );

	const shouldRenderActivatingCopy =
		( siteTransferData?.isTransferring || siteTransferData?.status === transferStates.COMPLETED ) &&
		! isPlanExpired;

	useEffect( () => {
		if ( isSiteAtomic && ! isPlanExpired ) {
			page.replace( redirectUrl );
		}
	}, [ isSiteAtomic, isPlanExpired, redirectUrl ] );

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
			title: translate( 'Logs' ),
			text: translate(
				'View and download PHP error and web server logs to diagnose and resolve issues quickly.'
			),
			supportContext: 'site-monitoring-logs',
		},
		{
			title: translate( 'Staging Site' ),
			text: translate( 'Preview and troubleshoot changes before updating your production site.' ),
			supportContext: 'hosting-staging-site',
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

	const activateTitle = hasEnTranslation( 'Activate all hosting features' )
		? translate( 'Activate all hosting features' )
		: translate( 'Activate all developer tools' );

	const unlockTitle = hasEnTranslation( 'Unlock all hosting features' )
		? translate( 'Unlock all hosting features' )
		: translate( 'Unlock all developer tools' );

	const activateDescription = hasEnTranslation(
		'Your plan includes all the hosting features listed below. Click "Activate now" to begin.'
	)
		? translate(
				'Your plan includes all the hosting features listed below. Click "Activate now" to begin.'
		  )
		: translate(
				'Your plan includes all the developer tools listed below. Click "Activate now" to begin.'
		  );

	const unlockDescription = hasEnTranslation(
		'Upgrade to the %(planName)s plan or higher to get access to all hosting features'
	)
		? // translators: %(planName)s is a plan name. E.g. Business plan.
		  translate(
				'Upgrade to the %(planName)s plan or higher to get access to all hosting features',
				{
					args: {
						planName: getPlan( PLAN_BUSINESS )?.getTitle() ?? '',
					},
				}
		  )
		: // translators: %(planName)s is a plan name. E.g. Business plan.
		  translate(
				'Upgrade to the %(planName)s plan or higher to get access to all developer tools',
				{
					args: {
						planName: getPlan( PLAN_BUSINESS )?.getTitle() ?? '',
					},
				}
		  );

	let title;
	let description;
	let buttons;
	if ( shouldRenderActivatingCopy ) {
		title = translate( 'Activating hosting features' );
		description = translate(
			"The hosting features will appear here automatically when they're ready!",
			{
				comment: 'Description of the hosting features page when the features are being activated.',
			}
		);
	} else if ( showActivationButton ) {
		title = activateTitle;
		description = activateDescription;
		buttons = <HostingActivationButton redirectUrl={ redirectUrl } />;
	} else {
		title = unlockTitle;
		description = unlockDescription;
		buttons = (
			<HostingHeroButton
				href={ upgradeLink }
				onClick={ () =>
					dispatch( recordTracksEvent( 'calypso_hosting_features_upgrade_plan_click' ) )
				}
			>
				{ translate( 'Upgrade now' ) }
			</HostingHeroButton>
		);
	}

	return (
		<div className="hosting-features">
			<HostingHero>
				{ shouldRenderActivatingCopy && <Spinner className="hosting-features__content-spinner" /> }
				<h1>{ title }</h1>
				<p>{ description }</p>
				{ buttons }
			</HostingHero>
			<HostingCardGrid>
				{ promoCards.map( ( card ) => (
					<PromoCard
						key={ card.title }
						title={ card.title }
						text={ card.text }
						supportContext={ card.supportContext }
					/>
				) ) }
			</HostingCardGrid>
		</div>
	);
};

export default HostingFeatures;
