import { FEATURE_SFTP, PLAN_BUSINESS, WPCOM_PLANS, getPlan } from '@automattic/calypso-products';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import { preventWidows } from 'calypso/lib/formatting';
import iconCloud from './icons/icon-cloud.svg';
import iconComments from './icons/icon-comments.svg';
import iconDatabase from './icons/icon-database.svg';
import iconServerRacks from './icons/icon-server-racks.svg';
import iconSSH from './icons/icon-ssh.svg';
import iconTerminal from './icons/icon-terminal.svg';
import type { TranslateResult } from 'i18n-calypso';
import './style.scss';

interface FeatureListItem {
	title: string;
	description: string;
	icon: string;
}

interface HostingUpsellNudgeTargetPlan {
	callToAction: TranslateResult;
	feature?: string;
	href: string;
	plan?: typeof WPCOM_PLANS;
	title: TranslateResult;
}

interface HostingUpsellNudgeProps {
	siteId: number;
	targetPlan?: HostingUpsellNudgeTargetPlan;
	secondaryCallToAction?: string;
	secondaryOnClick?: () => void;
}

export function HostingUpsellNudge( { siteId, targetPlan }: HostingUpsellNudgeProps ) {
	const translate = useTranslate();
	const features = useFeatureList();
	const callToActionText = translate( 'Upgrade to %(businessPlanName)s Plan', {
		args: { businessPlanName: getPlan( PLAN_BUSINESS )?.getTitle() ?? '' },
	} );
	const titleText = translate(
		'Upgrade to the %(businessPlanName)s plan to access all hosting features:',
		{
			args: { businessPlanName: getPlan( PLAN_BUSINESS )?.getTitle() ?? '' },
		}
	);
	const callToAction = targetPlan ? targetPlan.callToAction : callToActionText;
	const feature = targetPlan ? targetPlan.feature : FEATURE_SFTP;
	const href = targetPlan
		? targetPlan.href
		: addQueryArgs( `/checkout/${ siteId }/business`, {
				redirect_to: `/hosting-config/${ siteId }`,
		  } );
	const plan = targetPlan ? targetPlan.plan : PLAN_BUSINESS;
	const title = targetPlan ? targetPlan.title : titleText;

	return (
		<UpsellNudge
			className="hosting-upsell-nudge"
			compactButton={ false }
			title={ title }
			event="calypso_hosting_configuration_upgrade_click"
			href={ href }
			callToAction={ callToAction }
			plan={ plan as string }
			feature={ feature }
			showIcon
			list={ features }
			renderListItem={ ( { icon, title, description }: FeatureListItem ) => (
				<>
					<div className="hosting-upsell-nudge__feature-title">
						<img className="hosting-upsell-nudge__feature-icon" src={ icon } alt="" /> { title }
					</div>
					<div className="hosting-upsell-nudge__feature-description">
						{ preventWidows( description ) }
					</div>
				</>
			) }
		/>
	);
}

function useFeatureList(): FeatureListItem[] {
	const translate = useTranslate();

	return [
		{
			title: translate( 'SFTP' ),
			description: translate(
				'Streamline your workflow and edit your files with precision using an SFTP client.'
			),
			icon: iconCloud,
		},
		{
			title: translate( 'CLI Access' ),
			description: translate(
				'Use WP-CLI to manage plugins and users, or automate repetitive tasks from your terminal.'
			),
			icon: iconTerminal,
		},
		{
			title: translate( 'SSH' ),
			description: translate(
				'Take control of your website’s performance and security using SSH.'
			),
			icon: iconSSH,
		},
		{
			title: translate( 'Pick Your Data Center' ),
			description: translate(
				'Choose a primary data center for your site while still enjoying geo-redundant architecture.'
			),
			icon: iconServerRacks,
		},
		{
			title: translate( 'Database Access' ),
			description: translate(
				'Manage your website’s data easily, using phpMyAdmin to inspect tables and run queries.'
			),
			icon: iconDatabase,
		},
		{
			title: translate( 'Live Support' ),
			description: translate(
				'Whenever you’re stuck, our Happiness Engineers have the answers on hand.'
			),
			icon: iconComments,
		},
	];
}
