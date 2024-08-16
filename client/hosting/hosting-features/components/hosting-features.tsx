import config from '@automattic/calypso-config';
import { FEATURE_SFTP, getPlan, PLAN_BUSINESS } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Dialog } from '@automattic/components';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { Button, Spinner } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { useRef, useState, useEffect } from 'react';
import { AnyAction } from 'redux';
import EligibilityWarnings from 'calypso/blocks/eligibility-warnings';
import { HostingCard } from 'calypso/components/hosting-card';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { useSiteTransferStatusQuery } from 'calypso/landing/stepper/hooks/use-site-transfer/query';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { fetchAtomicTransfer } from 'calypso/state/atomic-transfer/actions';
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
	<HostingCard className="hosting-features__card" title={ title }>
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
	const showActivationModal = searchParams.get( 'activate' ) !== null;
	const [ showEligibility, setShowEligibility ] = useState( showActivationModal );
	const siteId = useSelector( getSelectedSiteId );
	const { siteSlug, isSiteAtomic, hasSftpFeature, isPlanExpired } = useSelector( ( state ) => ( {
		siteSlug: getSiteSlug( state, siteId ) || '',
		isSiteAtomic: isSiteWpcomAtomic( state, siteId as number ),
		hasSftpFeature: siteHasFeature( state, siteId, FEATURE_SFTP ),
		isPlanExpired: !! getSelectedSite( state )?.plan?.expired,
	} ) );
	// The ref is required to persist the value of redirect_to after renders
	const redirectUrl = useRef(
		searchParams.get( 'redirect_to' ) ?? hasSftpFeature
			? `/hosting-config/${ siteId }`
			: `/overview/${ siteId }`
	);
	const hasEnTranslation = useHasEnTranslation();

	const { data: siteTransferData, refetch: refetchSiteTransferData } = useSiteTransferStatusQuery(
		siteId || undefined
	);
	// `siteTransferData?.isTransferring` is not a fully reliable indicator by itself, which is why
	// we also look at `siteTransferData.status`
	const isTransferInProgress =
		siteTransferData?.isTransferring || siteTransferData?.status === transferStates.COMPLETED;

	useEffect( () => {
		if ( ! siteId ) {
			return;
		}

		const interval = setInterval( () => {
			if ( siteTransferData?.status !== transferStates.COMPLETED ) {
				refetchSiteTransferData();
			} else {
				clearInterval( interval );
				dispatch( fetchAtomicTransfer( siteId ) as unknown as AnyAction );
			}
		}, 3000 );

		return () => clearInterval( interval );
	}, [ siteId, siteTransferData?.status, refetchSiteTransferData, dispatch ] );

	useEffect( () => {
		if ( isSiteAtomic && ! isPlanExpired ) {
			page.replace( redirectUrl.current );
		}
	}, [ isSiteAtomic, isPlanExpired ] );

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
	const handleTransfer = ( options: { geo_affinity?: string } ) => {
		dispatch( recordTracksEvent( 'calypso_hosting_features_activate_confirm' ) );
		const params = new URLSearchParams( {
			siteId: String( siteId ),
			redirect_to: redirectUrl.current,
			feature: FEATURE_SFTP,
			initiate_transfer_context: 'hosting',
			initiate_transfer_geo_affinity: options.geo_affinity || '',
		} );
		page( `/setup/transferring-hosted-site?${ params }` );
	};

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
	if ( isTransferInProgress && config.isEnabled( 'hosting-overview-refinements' ) ) {
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
		buttons = (
			<>
				<Button
					variant="primary"
					className="hosting-features__button"
					onClick={ () => {
						if ( showActivationButton ) {
							dispatch( recordTracksEvent( 'calypso_hosting_features_activate_click' ) );
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
						currentContext="hosting-features"
					/>
				</Dialog>
			</>
		);
	} else {
		title = unlockTitle;
		description = unlockDescription;
		buttons = (
			<Button
				variant="primary"
				className="hosting-features__button"
				href={ upgradeLink }
				onClick={ () =>
					dispatch( recordTracksEvent( 'calypso_hosting_features_upgrade_plan_click' ) )
				}
			>
				{ translate( 'Upgrade now' ) }
			</Button>
		);
	}

	return (
		<div className="hosting-features">
			<div className="hosting-features__hero">
				{ isTransferInProgress && <Spinner className="hosting-features__content-spinner" /> }
				<h1>{ title }</h1>
				<p>{ description }</p>
				{ buttons }
			</div>
			<div className="hosting-features__cards">
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

export default HostingFeatures;
