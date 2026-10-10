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
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Icon,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __, _n, sprintf } from '@wordpress/i18n';
import { chevronDown, chevronRight, chevronUp } from '@wordpress/icons';
import { Fragment, useState } from 'react';
import { Card, CardBody, CardDivider, CardHeader } from '../../../components/card';
import RouterLinkButton from '../../../components/router-link-button';
import { SectionHeader } from '../../../components/section-header';
import { Text } from '../../../components/text';
import { getTailoredPlan } from './goal-plan';
import PartnerManagerHub from './partner-manager-hub';
import type { PlanStep, TailoredPlanLinks } from './goal-plan';
import type { PartnerCalls } from './partner-calls';
import type { PartnerManager } from './partner-managers';
import type { SignupGoal, SignupProfile } from './signup-profile';
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
}: {
	step: PlanStep;
	shouldUseRouterLink?: boolean;
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
			<Icon icon={ chevronRight } size={ 24 } className="a4a-plan-step-row__chevron" />
		</>
	);
	const props = {
		className: 'a4a-plan-step-row',
		// The visible title already names the destination; the label adds the action.
		'aria-label': `${ step.title }: ${ step.actionLabel }`,
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

export type PlanCall =
	| { type: 'advisor' }
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
			return sprintf( __( 'We’ll map out how %s can unlock more client leads.' ), name );
		case 'passive_income':
			/* translators: %s is the agency name */
			return sprintf( __( 'We’ll map out how %s can start earning recurring revenue.' ), name );
		case 'better_hosting':
			/* translators: %s is the agency name */
			return sprintf( __( 'We’ll find the right hosting setup for %s and its clients.' ), name );
		case 'optimize_operations':
			/* translators: %s is the agency name */
			return sprintf( __( 'We’ll show %s the tools that save the most time.' ), name );
		default:
			/* translators: %s is the agency name */
			return sprintf( __( 'We’ll build a growth plan around what %s needs most.' ), name );
	}
};

function CallSection( {
	call,
	profile,
	onScheduleCall,
	isSchedulingCall,
}: {
	call: PlanCall;
	profile: SignupProfile;
	onScheduleCall?: () => void;
	isSchedulingCall?: boolean;
} ) {
	const isSmallViewport = useViewportMatch( 'medium', '<' );

	if ( call.type === 'check-in' ) {
		return (
			<PartnerManagerHub
				manager={ call.manager }
				calls={ call.calls }
				completedTodoIds={ call.completedTodoIds }
				onToggleTodo={ call.onToggleTodo }
				discussionNotes={ call.discussionNotes }
				onSaveNotes={ call.onSaveNotes }
				onScheduleCall={ onScheduleCall }
				isSchedulingCall={ isSchedulingCall }
			/>
		);
	}

	return (
		<HStack
			spacing={ 4 }
			alignment={ isSmallViewport ? 'flex-start' : 'center' }
			justify="space-between"
			wrap={ isSmallViewport }
		>
			<VStack spacing={ 1 } style={ { flex: 1 } }>
				<Heading level={ 3 } size={ 15 } weight={ 500 }>
					{ __( 'Schedule your 30 minute advisor call' ) }
				</Heading>
				<Text variant="muted" lineHeight="20px">
					{ getAdvisorFocus( profile.goals[ 0 ], profile.agencyName ) }
				</Text>
			</VStack>
			<Button
				variant="primary"
				onClick={ onScheduleCall }
				isBusy={ isSchedulingCall }
				disabled={ ! onScheduleCall || isSchedulingCall }
				style={ { flexShrink: 0 } }
			>
				{ __( 'Schedule a call' ) }
			</Button>
		</HStack>
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
}

// Compact goal row for established agencies: collapsed to its title and step
// count, expanding to show the description and steps on demand.
function CompactSection( {
	section,
	rank,
	shouldUseRouterLink,
}: {
	section: ReturnType< typeof getTailoredPlan >[ number ];
	rank: number;
	shouldUseRouterLink?: boolean;
} ) {
	const [ isOpen, setIsOpen ] = useState( false );
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
						{ section.title }
					</Text>
				</HStack>
				<HStack spacing={ 2 } alignment="center" justify="flex-end" expanded={ false }>
					<Text variant="muted" size={ 12 } lineHeight="16px">
						{ sprintf(
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
							<StepRow key={ step.id } step={ step } shouldUseRouterLink={ shouldUseRouterLink } />
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
}: TailoredPlanCardProps ) {
	const isSmallViewport = useViewportMatch( 'medium', '<' );
	const [ isExpanded, setIsExpanded ] = useState( true );
	const sections = getTailoredPlan( profile, links, tierLevel );
	const toggleLabel = isExpanded ? __( 'Hide growth plan steps' ) : __( 'Show growth plan steps' );

	if ( call.type === 'check-in' ) {
		return (
			<CompactPlanCard
				sections={ sections }
				managerFirstName={ call.manager.name.split( ' ' )[ 0 ] }
				shouldUseRouterLink={ shouldUseRouterLink }
			/>
		);
	}

	return (
		<Card>
			<CardHeader>
				{ /* The toggle sits outside SectionHeader so it pins to the card's right edge. */ }
				<HStack spacing={ 4 } alignment="flex-start" justify="space-between">
					<SectionHeader
						level={ 2 }
						title={ __( 'Your growth plan' ) }
						description={ __(
							'Based on what you told us at signup, here’s where to start, with your top priority first.'
						) }
					/>
					<Button
						size="compact"
						icon={ isExpanded ? chevronUp : chevronDown }
						label={ toggleLabel }
						aria-expanded={ isExpanded }
						onClick={ () => setIsExpanded( ( value ) => ! value ) }
						style={ { flexShrink: 0 } }
					/>
				</HStack>
			</CardHeader>
			<CardBody>
				<CallSection
					call={ call }
					profile={ profile }
					onScheduleCall={ onScheduleCall }
					isSchedulingCall={ isSchedulingCall }
				/>
			</CardBody>
			{ isExpanded &&
				sections.map( ( section, index ) => (
					<Fragment key={ section.goal }>
						<CardDivider style={ { borderColor: 'var(--color-gray-100)' } } />
						<CardBody>
							<VStack spacing={ 4 }>
								<HStack spacing={ 3 } alignment="flex-start" justify="flex-start">
									<RankBadge rank={ index + 1 } />
									<VStack spacing={ 1 }>
										<Heading
											level={ 3 }
											size={ 15 }
											weight={ 500 }
											lineHeight={ `${ RANK_SIZE }px` }
										>
											<span className="screen-reader-text">
												{ sprintf(
													/* translators: %d is the goal's priority, 1 being the top priority */
													__( 'Priority %d:' ),
													index + 1
												) }{ ' ' }
											</span>
											{ section.title }
										</Heading>
										<Text variant="muted" lineHeight="20px">
											{ section.description }
										</Text>
									</VStack>
								</HStack>
								<div
									className="a4a-plan-steps"
									style={ { marginInlineStart: isSmallViewport ? 0 : `${ RANK_SIZE + 12 }px` } }
								>
									{ section.steps.map( ( step ) => (
										<StepRow
											key={ step.id }
											step={ step }
											shouldUseRouterLink={ shouldUseRouterLink }
										/>
									) ) }
								</div>
							</VStack>
						</CardBody>
					</Fragment>
				) ) }
		</Card>
	);
}
