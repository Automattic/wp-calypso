import { activeAgencyQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Button, __experimentalHeading as Heading } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { calendar, Icon, people } from '@wordpress/icons';
import { useId, useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { useDesignPreview } from '../../design-preview';
import { TIER_OVERVIEW_CONTENT } from '../../overview/constants';
import { useScheduleCall } from '../../tiers/use-schedule-call';
import PortfolioSitesList from './portfolio-sites';
import SiteActionsMenu from './site-access-illustration';
import type { AgencyPartnerManager } from '@automattic/api-core';
import './overview-story.scss';

function PartnerManagerPhoto( { avatarUrl }: { avatarUrl?: string | null } ) {
	const [ hasFailed, setHasFailed ] = useState( false );
	if ( ! avatarUrl || hasFailed ) {
		return (
			<span className="agency-sites-story__person-photo is-placeholder">
				<Icon icon={ people } size={ 48 } />
			</span>
		);
	}
	return (
		<img
			className="agency-sites-story__person-photo"
			src={ avatarUrl }
			alt=""
			width={ 112 }
			height={ 112 }
			onError={ () => setHasFailed( true ) }
		/>
	);
}

function MigrationContact( {
	partnerManager,
	hasPartnerManager,
	onScheduleCall,
	isSchedulingCall,
}: {
	partnerManager?: AgencyPartnerManager | null;
	hasPartnerManager: boolean;
	onScheduleCall: () => void;
	isSchedulingCall: boolean;
} ) {
	return (
		<div className="agency-sites-story__person">
			<div className="agency-sites-story__person-portrait">
				<PartnerManagerPhoto avatarUrl={ partnerManager?.avatar_url } />
				<p className="agency-sites-story__person-bubble">
					{ __( 'Let’s plan your move together.' ) }
				</p>
			</div>
			<strong className="agency-sites-story__person-name">
				{ partnerManager?.name ??
					( hasPartnerManager ? __( 'Your partner manager' ) : __( 'Your agency team' ) ) }
			</strong>
			<span className="agency-sites-story__person-role">
				{ partnerManager
					? __( 'Partner manager, Automattic for Agencies' )
					: __( 'Automattic for Agencies' ) }
			</span>
			<Button
				variant="primary"
				icon={ calendar }
				onClick={ onScheduleCall }
				isBusy={ isSchedulingCall }
				disabled={ isSchedulingCall }
				__next40pxDefaultSize
			>
				{ __( 'Schedule a call' ) }
			</Button>
		</div>
	);
}

export default function SitesOverviewStory() {
	const id = useId();
	const { data: agency } = useQuery( activeAgencyQuery() );
	const { samplePartnerManager } = useDesignPreview();
	const partnerManager = agency?.partner_manager ?? samplePartnerManager;
	const { recordTracksEvent } = useAnalytics();
	const { scheduleCall, isLoading: isSchedulingCall } = useScheduleCall( agency?.id );
	const agencyTier = agency?.tier?.id ?? 'emerging-partner';
	const hasPartnerManager = TIER_OVERVIEW_CONTENT[ agencyTier ].hasPartnerManager;
	const sections = [
		{
			key: 'portfolio',
			title: __( 'See your whole portfolio' ),
			description: __(
				'Bring your clients’ WordPress sites into one view, even when they use different hosts. Find a site, see where it’s hosted, and check its status without keeping track of a dozen different bookmarks.'
			),
			graphic: <PortfolioSitesList />,
		},
		{
			key: 'work',
			title: __( 'Get straight to the site you need' ),
			description: __(
				'Go from your portfolio to a site’s WordPress admin or live homepage. Whether you’re publishing a client update or checking the finished page, your next stop is close at hand.'
			),
			graphic: <SiteActionsMenu />,
		},
		{
			key: 'migration',
			title: __( 'Get a hand moving your portfolio' ),
			description:
				partnerManager || hasPartnerManager
					? __(
							'Moving a group of sites to WordPress.com or Pressable? Talk with your partner manager about hosting, migration help, and a schedule that works for your clients.'
						)
					: __(
							'Moving a group of sites to WordPress.com or Pressable? Talk with our agency team about hosting, migration help, and a schedule that works for your clients.'
						),
			graphic: (
				<MigrationContact
					partnerManager={ partnerManager }
					hasPartnerManager={ hasPartnerManager }
					isSchedulingCall={ isSchedulingCall }
					onScheduleCall={ () => {
						recordTracksEvent( 'calypso_a4a_sites_migration_schedule_call_click', {
							agency_tier: agencyTier,
						} );
						void scheduleCall();
					} }
				/>
			),
		},
	];
	const faqs = [
		{
			question: __( 'Do I have to change hosting?' ),
			answer: __(
				'No. Connecting a site keeps its current hosting and domain. Choose Move if you want to switch to WordPress.com or Pressable; you can do that later, too.'
			),
		},
		{
			question: __( 'What do I need to connect a site?' ),
			answer: __(
				'You’ll need administrator access to install the Automattic for Agencies or Jetpack plugin and approve the connection. Sites already linked to your WordPress.com account can be added directly.'
			),
		},
		{
			question: __( 'Can I bring in several sites at once?' ),
			answer: __(
				'Yes. Paste a list of addresses, upload a spreadsheet, or choose sites from your WordPress.com account. Review the list and pick the sites you want to start with.'
			),
		},
		{
			question: __( 'Can someone help me move a site?' ),
			answer: __(
				'Yes. When moving to WordPress.com or Pressable, choose to have our team handle the migration or use the tools to move it yourself. You’ll review the copied site before switching your domain.'
			),
		},
	];
	return (
		<div className="agency-sites-story">
			{ sections.map( ( section ) => (
				<section
					className="agency-sites-story__section"
					data-topic={ section.key }
					aria-labelledby={ `${ id }-${ section.key }` }
					key={ section.key }
				>
					<div
						className="agency-sites-story__graphic"
						aria-hidden={ section.key !== 'migration' || undefined }
					>
						{ section.graphic }
					</div>
					<div className="agency-sites-story__copy">
						<Heading id={ `${ id }-${ section.key }` } level={ 2 }>
							{ section.title }
						</Heading>
						<p>{ section.description }</p>
					</div>
				</section>
			) ) }
			<section className="agency-sites-story__faq" aria-labelledby={ `${ id }-faq` }>
				<Heading id={ `${ id }-faq` } level={ 2 }>
					{ __( 'A few things to know before you start' ) }
				</Heading>
				<div className="agency-sites-story__faq-list">
					{ faqs.map( ( faq ) => (
						<div key={ faq.question }>
							<Heading level={ 3 }>{ faq.question }</Heading>
							<p>{ faq.answer }</p>
						</div>
					) ) }
				</div>
			</section>
		</div>
	);
}
