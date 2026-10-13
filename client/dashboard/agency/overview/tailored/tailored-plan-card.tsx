/**
 * PROTOTYPE — proof of concept only.
 *
 * The “Your growth plan” card at the top of the Overview. A call section
 * always leads (the 30 minute advisor call for new agencies, or a check-in
 * with their partner manager for established ones), followed by one numbered
 * section per signup goal, in priority order. The goal sections collapse; the
 * title and call section always stay visible.
 */
import {
	Button,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Icon,
	VisuallyHidden,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __, _n, sprintf } from '@wordpress/i18n';
import { chevronDown, chevronRight, chevronUp, video } from '@wordpress/icons';
import { Badge } from '@wordpress/ui';
import { Fragment, useState } from 'react';
import { Card, CardBody, CardDivider, CardHeader } from '../../../components/card';
import Grid from '../../../components/grid';
import RouterLinkButton from '../../../components/router-link-button';
import { SectionHeader } from '../../../components/section-header';
import { Text } from '../../../components/text';
import DirectoryDemoModal from './directory-demo-modal';
import { getTailoredPlan } from './goal-plan';
import { NextCheckIn } from './partner-manager-hub';
import type { PlanStep, TailoredPlanLinks } from './goal-plan';
import type { PartnerCalls } from './partner-calls';
import type { PartnerManager } from './partner-managers';
import type { SignupGoal, SignupProfile } from './signup-profile';
import type { ReactNode } from 'react';
import './style.scss';

const RANK_SIZE = 28;

function RankBadge( { rank }: { rank: number } ) {
	return (
		<div
			aria-hidden="true"
			style={ {
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				flexShrink: 0,
				width: `${ RANK_SIZE }px`,
				height: `${ RANK_SIZE }px`,
				borderRadius: '50%',
				background: 'var(--wp-admin-theme-color)',
				color: 'var(--color-text-inverted)',
				fontSize: '13px',
				fontWeight: 600,
			} }
		>
			{ rank }
		</div>
	);
}

// One clickable row per step: title, description, and a chevron. The whole
// row is the link, so the plan reads as a list instead of a wall of buttons.
function StepRow( {
	step,
	shouldUseRouterLink,
	isDone = false,
}: {
	step: PlanStep;
	shouldUseRouterLink?: boolean;
	/** Already done (e.g. they own a Pressable plan); still links to the destination. */
	isDone?: boolean;
} ) {
	const content = (
		<>
			<span className="a4a-plan-step-row__text">
				<Text weight={ 500 } lineHeight="20px">
					{ step.title }
				</Text>
				<Text variant="muted" size={ 13 } lineHeight="20px">
					{ step.description }
				</Text>
			</span>
			{ isDone ? (
				<span style={ { flexShrink: 0 } }>
					<Badge intent="stable">{ __( 'Done' ) }</Badge>
				</span>
			) : (
				<Icon
					icon={ step.opensVideo ? video : chevronRight }
					size={ 24 }
					className="a4a-plan-step-row__chevron"
				/>
			) }
		</>
	);
	const props = {
		className: 'a4a-plan-step-row',
		// The visible title already names the destination; the label adds the action.
		'aria-label': isDone
			? `${ step.title }: ${ __( 'Done' ) }`
			: `${ step.title }: ${ step.actionLabel }`,
	};

	if ( typeof step.action === 'function' ) {
		return (
			<Button { ...props } onClick={ step.action }>
				{ content }
			</Button>
		);
	}
	if ( shouldUseRouterLink ) {
		return (
			<RouterLinkButton { ...props } to={ step.action }>
				{ content }
			</RouterLinkButton>
		);
	}
	return (
		<Button { ...props } href={ step.action }>
			{ content }
		</Button>
	);
}

/** A booked advisor call (the getting-started scenario). */
export interface BookedAdvisorCall {
	advisor: PartnerManager;
	date: Date;
	joinUrl: string;
	/** What the call will cover, e.g. setting up WooPayments. */
	topic: string;
	discussionNotes: string;
	onSaveNotes: ( notes: string ) => void;
}

export type PlanCall =
	| { type: 'advisor'; booked?: BookedAdvisorCall }
	| {
			type: 'check-in';
			manager: PartnerManager;
			calls: PartnerCalls;
			completedTodoIds: string[];
			onToggleTodo: ( id: string ) => void;
			discussionNotes: string;
			onSaveNotes: ( notes: string ) => void;
	  };

// What the advisor call will focus on, from the agency's #1 goal.
const getAdvisorFocus = ( goal: SignupGoal | undefined, agencyName: string ) => {
	const name = agencyName || __( 'your agency' );
	switch ( goal ) {
		case 'more_leads':
			/* translators: %s is the agency name */
			return sprintf( __( '30 minutes to map out how %s can unlock more client leads.' ), name );
		case 'passive_income':
			return sprintf(
				/* translators: %s is the agency name */
				__( '30 minutes to map out how %s can start earning recurring revenue.' ),
				name
			);
		case 'better_hosting':
			return sprintf(
				/* translators: %s is the agency name */
				__( '30 minutes to find the right hosting setup for %s and its clients.' ),
				name
			);
		case 'optimize_operations':
			/* translators: %s is the agency name */
			return sprintf( __( '30 minutes on the tools that will save %s the most time.' ), name );
		default:
			/* translators: %s is the agency name */
			return sprintf( __( '30 minutes to shape a growth plan around what %s needs most.' ), name );
	}
};

// A tinted tile in the welcome section: what it is, why it helps, and one action.
function StartTile( {
	title,
	description,
	action,
}: {
	title: string;
	description: string;
	action: ReactNode;
} ) {
	return (
		<VStack
			spacing={ 3 }
			justify="space-between"
			style={ {
				padding: '16px',
				borderRadius: '8px',
				background: 'var(--color-gray-0, #f6f7f7)',
			} }
		>
			<VStack spacing={ 1 }>
				<Text weight={ 500 } lineHeight="20px">
					{ title }
				</Text>
				<Text variant="muted" size={ 13 } lineHeight="20px">
					{ description }
				</Text>
			</VStack>
			<HStack justify="flex-start">{ action }</HStack>
		</VStack>
	);
}

interface TailoredPlanCardProps {
	profile: SignupProfile;
	links: TailoredPlanLinks;
	call: PlanCall;
	/** Agency tier level, so steps match what's unlocked (e.g. directories at Agency Partner). */
	tierLevel?: number;
	onScheduleCall?: () => void;
	isSchedulingCall?: boolean;
	shouldUseRouterLink?: boolean;
	/** Compact tier summary, shown when `showTierProgress` is true. */
	tierStrip?: ReactNode;
	/** Shows the tier and influenced revenue meter (partly invested agencies only). */
	showTierProgress?: boolean;
	/** Steps the agency has already done, shown with a Done badge. */
	completedStepIds?: string[];
}

// Compact goal row for established agencies: collapsed to its title and step
// count, expanding to show the description and steps on demand.
function CompactSection( {
	section,
	rank,
	shouldUseRouterLink,
	defaultOpen = false,
	completedStepIds = [],
}: {
	section: ReturnType< typeof getTailoredPlan >[ number ];
	rank: number;
	shouldUseRouterLink?: boolean;
	defaultOpen?: boolean;
	completedStepIds?: string[];
} ) {
	const [ isOpen, setIsOpen ] = useState( defaultOpen );
	const doneCount = section.steps.filter( ( step ) => completedStepIds.includes( step.id ) ).length;
	const panelId = `a4a-plan-goal-${ section.goal }`;

	return (
		<VStack spacing={ 3 }>
			<Button
				className="a4a-plan-goal-toggle"
				aria-expanded={ isOpen }
				aria-controls={ panelId }
				onClick={ () => setIsOpen( ( value ) => ! value ) }
			>
				<HStack spacing={ 3 } alignment="center" justify="flex-start" style={ { flex: 1 } }>
					<RankBadge rank={ rank } />
					<Text weight={ 500 } size={ 15 } lineHeight="20px">
						<VisuallyHidden as="span">
							{ sprintf(
								/* translators: %d is the goal's priority, 1 being the top priority */
								__( 'Priority %d:' ),
								rank
							) }{ ' ' }
						</VisuallyHidden>
						{ section.title }
					</Text>
				</HStack>
				<HStack spacing={ 2 } alignment="center" justify="flex-end" expanded={ false }>
					<Text variant="muted" size={ 12 } lineHeight="16px">
						{ doneCount
							? sprintf(
									/* translators: 1: steps done, 2: total steps for this goal */
									__( '%1$d of %2$d done' ),
									doneCount,
									section.steps.length
								)
							: sprintf(
									/* translators: %d is the number of steps for this goal */
									_n( '%d step', '%d steps', section.steps.length ),
									section.steps.length
								) }
					</Text>
					<Icon icon={ isOpen ? chevronUp : chevronDown } size={ 24 } />
				</HStack>
			</Button>
			{ isOpen && (
				<VStack
					spacing={ 3 }
					id={ panelId }
					style={ { paddingInlineStart: `${ RANK_SIZE + 12 }px` } }
				>
					<Text variant="muted" lineHeight="20px">
						{ section.description }
					</Text>
					<div className="a4a-plan-steps">
						{ section.steps.map( ( step ) => (
							<StepRow
								key={ step.id }
								step={ step }
								shouldUseRouterLink={ shouldUseRouterLink }
								isDone={ completedStepIds.includes( step.id ) }
							/>
						) ) }
					</div>
				</VStack>
			) }
		</VStack>
	);
}

/**
 * Established agencies with a partner manager: the call, recap, and to-dos live
 * in their own card, so the plan stays a short list of goals that expand when
 * needed.
 */
function CompactPlanCard( {
	sections,
	managerFirstName,
	shouldUseRouterLink,
}: {
	sections: ReturnType< typeof getTailoredPlan >;
	managerFirstName: string;
	shouldUseRouterLink?: boolean;
} ) {
	return (
		<Card>
			<CardHeader>
				<SectionHeader
					level={ 2 }
					title={ __( 'Your growth plan' ) }
					description={ sprintf(
						/* translators: %s is the partner manager's first name */
						__( 'Your goals, top priority first. You and %s update these at each check-in.' ),
						managerFirstName
					) }
				/>
			</CardHeader>
			{ sections.map( ( section, index ) => (
				<Fragment key={ section.goal }>
					{ index > 0 && <CardDivider style={ { borderColor: 'var(--color-gray-100)' } } /> }
					<CardBody>
						<CompactSection
							section={ section }
							rank={ index + 1 }
							shouldUseRouterLink={ shouldUseRouterLink }
						/>
					</CardBody>
				</Fragment>
			) ) }
		</Card>
	);
}

export default function TailoredPlanCard( {
	profile,
	links,
	call,
	tierLevel = 0,
	onScheduleCall,
	isSchedulingCall,
	shouldUseRouterLink,
	tierStrip,
	showTierProgress = false,
	completedStepIds = [],
}: TailoredPlanCardProps ) {
	const isSmallViewport = useViewportMatch( 'medium', '<' );
	const [ openVideo, setOpenVideo ] = useState< 'overview' | 'directory' | null >( null );
	const sections = getTailoredPlan(
		profile,
		{ ...links, onWatchDirectoryDemo: () => setOpenVideo( 'directory' ) },
		tierLevel
	);
	const hasTierBlock = showTierProgress && !! tierStrip;

	const demoModal = openVideo && (
		<DirectoryDemoModal
			{ ...( openVideo === 'overview' && {
				title: __( 'How Automattic for Agencies works' ),
				callPrompt: __( 'Want a walkthrough for your agency?' ),
			} ) }
			onClose={ () => setOpenVideo( null ) }
			scheduleCallLabel={
				call.type === 'check-in'
					? sprintf(
							/* translators: %s is the partner manager's first name */
							__( 'Schedule a check-in with %s' ),
							call.manager.name.split( ' ' )[ 0 ]
						)
					: __( 'Schedule your free advisor call' )
			}
			onScheduleCall={ onScheduleCall }
			isSchedulingCall={ isSchedulingCall }
		/>
	);

	if ( call.type === 'check-in' ) {
		return (
			<>
				<CompactPlanCard
					sections={ sections }
					managerFirstName={ call.manager.name.split( ' ' )[ 0 ] }
					shouldUseRouterLink={ shouldUseRouterLink }
				/>
				{ demoModal }
			</>
		);
	}

	const booked = call.type === 'advisor' ? call.booked : undefined;
	const welcomeHeader = (
		<SectionHeader
			level={ 2 }
			// The page header already greets them by name.
			title={
				completedStepIds.length
					? __( 'Your growth plan' )
					: __( 'Welcome to Automattic for Agencies' )
			}
			description={
				completedStepIds.length
					? __( 'You’re off to a good start. Here’s what’s next, with your top priority first.' )
					: __(
							'To get the most out of the program, start with a quick overview and a free call with an advisor. Your growth plan below is built from what you told us at signup, top priority first.'
						)
			}
		/>
	);
	const goalRows = ( dividerBeforeFirst: boolean ) =>
		sections.map( ( section, index ) => (
			<Fragment key={ section.goal }>
				{ ( index > 0 || dividerBeforeFirst ) && (
					<CardDivider style={ { borderColor: 'var(--color-gray-100)' } } />
				) }
				<CardBody>
					<CompactSection
						section={ section }
						rank={ index + 1 }
						shouldUseRouterLink={ shouldUseRouterLink }
						// The top priority starts open; the rest start closed.
						defaultOpen={ index === 0 }
						completedStepIds={ completedStepIds }
					/>
				</CardBody>
			</Fragment>
		) );

	// A booked advisor call reads like an established agency's partner manager card:
	// tier and IAR first, then the call, then the goals.
	if ( booked ) {
		return (
			<>
				<Card>
					{ hasTierBlock && (
						<>
							<CardBody className="a4a-tier-band">{ tierStrip }</CardBody>
							<CardDivider />
						</>
					) }
					<CardBody>
						<NextCheckIn
							kind="advisor"
							manager={ booked.advisor }
							date={ booked.date }
							joinUrl={ booked.joinUrl }
							topic={ booked.topic }
							discussionNotes={ booked.discussionNotes }
							onSaveNotes={ booked.onSaveNotes }
							onScheduleCall={ onScheduleCall }
							isSchedulingCall={ isSchedulingCall }
						/>
					</CardBody>
					<CardDivider />
					<CardBody>{ welcomeHeader }</CardBody>
					{ goalRows( true ) }
				</Card>
				{ demoModal }
			</>
		);
	}

	return (
		<>
			<Card>
				<CardHeader>
					<VStack spacing={ 6 }>
						{ welcomeHeader }
						<Grid columns={ isSmallViewport ? 1 : 2 } gap="lg">
							<StartTile
								title={ __( 'Watch the program overview' ) }
								description={ __(
									'A short tour of tiers, referrals, hosting, and leads, and how they add up.'
								) }
								action={
									<Button
										variant="secondary"
										size="compact"
										icon={ video }
										onClick={ () => setOpenVideo( 'overview' ) }
									>
										{ __( 'Watch the video' ) }
									</Button>
								}
							/>
							<StartTile
								title={ __( 'Schedule your free advisor call' ) }
								description={ getAdvisorFocus( profile.goals[ 0 ], profile.agencyName ) }
								action={
									<Button
										variant="primary"
										size="compact"
										onClick={ onScheduleCall }
										isBusy={ isSchedulingCall }
										disabled={ ! onScheduleCall || isSchedulingCall }
									>
										{ __( 'Schedule a call' ) }
									</Button>
								}
							/>
						</Grid>
					</VStack>
				</CardHeader>
				{ /* CardHeader draws its own bottom border, so only later blocks get a divider. */ }
				{ hasTierBlock && <CardBody className="a4a-tier-band">{ tierStrip }</CardBody> }
				{ /* Each goal collapses on its own; the top priority starts open. */ }
				{ goalRows( hasTierBlock ) }
			</Card>
			{ demoModal }
		</>
	);
}
