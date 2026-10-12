/**
 * PROTOTYPE — proof of concept only.
 *
 * “Learn” card for the Grow section: enablement material picked for the
 * agency's goals, linking into the Library. Items are samples until the
 * Library's resources can be tagged by goal.
 */
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Icon,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronRight, page, postList, tool, video } from '@wordpress/icons';
import { Badge } from '@wordpress/ui';
import { Card, CardBody, CardHeader } from '../../../components/card';
import RouterLinkButton from '../../../components/router-link-button';
import { SectionHeader } from '../../../components/section-header';
import { Text } from '../../../components/text';
import OverviewLinkButton from '../overview-link-button';
import type { SignupGoal } from './signup-profile';
import './style.scss';

type LearnMedium = 'read' | 'video' | 'course' | 'playbook';

// One icon per kind of material, so the list scans by format.
const MEDIUM_ICONS: Record< LearnMedium, JSX.Element > = {
	read: page,
	video,
	course: postList,
	playbook: tool,
};

interface LearnItem {
	id: string;
	title: string;
	medium: LearnMedium;
	format: string;
	/** PROTOTYPE: sample progress; the agency has already gone through it. */
	isRead?: boolean;
	duration: string;
	goals: SignupGoal[];
}

const getLearnItems = (): LearnItem[] => [
	{
		id: 'learn-directory-profile',
		medium: 'read',
		isRead: true,
		title: __( 'Write a partner directory profile that wins inquiries' ),
		format: __( 'Guide' ),
		duration: __( '8 min read' ),
		goals: [ 'more_leads' ],
	},
	{
		id: 'learn-pricing-retainers',
		medium: 'video',
		title: __( 'Client conversations that work: pricing care plans and retainers' ),
		format: __( 'Sales training' ),
		duration: __( '20 min video' ),
		goals: [ 'more_leads', 'passive_income' ],
	},
	{
		id: 'learn-referral-cart',
		medium: 'course',
		title: __( 'Referrals 101: earn on the products your clients already buy' ),
		format: __( 'Course' ),
		duration: __( '15 min' ),
		goals: [ 'passive_income' ],
	},
	{
		id: 'learn-pressable-playbook',
		medium: 'playbook',
		title: __( 'The Pressable Migration Playbook' ),
		format: __( 'Playbook' ),
		duration: __( '12 min read' ),
		goals: [ 'better_hosting' ],
	},
	{
		id: 'learn-mcp-reports',
		medium: 'video',
		title: __( 'Send weekly client reports with the agency MCP' ),
		format: __( 'Tutorial' ),
		duration: __( '10 min video' ),
		goals: [ 'optimize_operations' ],
	},
	{
		id: 'learn-ai-visibility',
		medium: 'read',
		title: __( 'Package AI visibility audits as a new service' ),
		format: __( 'Guide' ),
		duration: __( '10 min read' ),
		goals: [ 'optimize_operations', 'more_leads' ],
	},
];

// Best match to the agency's ranked goals first; keeps the original order on ties.
function getRankedLearnItems( goals: SignupGoal[], limit = 4 ) {
	const rankOf = ( item: LearnItem ) => {
		const ranks = item.goals.map( ( goal ) => goals.indexOf( goal ) ).filter( ( r ) => r >= 0 );
		return ranks.length ? Math.min( ...ranks ) : goals.length + 1;
	};
	return getLearnItems()
		.map( ( item, index ) => ( { item, index } ) )
		.sort( ( a, b ) => rankOf( a.item ) - rankOf( b.item ) || a.index - b.index )
		.slice( 0, limit )
		.map( ( { item } ) => item );
}

interface LearnCardProps {
	goals: SignupGoal[];
	libraryHref: string;
	shouldUseRouterLink?: boolean;
}

export default function LearnCard( {
	goals,
	libraryHref,
	shouldUseRouterLink = true,
}: LearnCardProps ) {
	const items = getRankedLearnItems( goals );
	const LinkButton = shouldUseRouterLink ? RouterLinkButton : null;

	return (
		<Card>
			<CardHeader>
				<SectionHeader
					level={ 2 }
					title={ __( 'Learn' ) }
					description={ __(
						'Videos, guides, courses, and playbooks from the Library, ranked by your goals.'
					) }
				/>
			</CardHeader>
			<CardBody>
				<VStack spacing={ 4 }>
					<div className="a4a-plan-steps">
						{ items.map( ( item ) => {
							const content = (
								<>
									<span
										aria-hidden="true"
										style={ {
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											flexShrink: 0,
											width: '40px',
											height: '40px',
											borderRadius: '8px',
											background: 'rgba(56, 88, 233, 0.08)',
										} }
									>
										<Icon
											icon={ MEDIUM_ICONS[ item.medium ] }
											size={ 24 }
											style={ { fill: 'var(--wp-admin-theme-color)' } }
										/>
									</span>
									<span className="a4a-plan-step-row__text">
										<Text weight={ 500 } lineHeight="20px">
											{ item.title }
										</Text>
										<Text variant="muted" size={ 12 } lineHeight="16px">
											{ `${ item.format } · ${ item.duration }` }
										</Text>
									</span>
									{ item.isRead ? (
										<span style={ { flexShrink: 0 } }>
											<Badge intent="stable">{ __( 'Read' ) }</Badge>
										</span>
									) : (
										<Icon
											icon={ chevronRight }
											size={ 24 }
											className="a4a-plan-step-row__chevron"
										/>
									) }
								</>
							);
							return LinkButton ? (
								<LinkButton key={ item.id } className="a4a-plan-step-row" to={ libraryHref }>
									{ content }
								</LinkButton>
							) : (
								<a
									key={ item.id }
									className="a4a-plan-step-row components-button"
									href={ libraryHref }
								>
									{ content }
								</a>
							);
						} ) }
					</div>
					<HStack justify="flex-start">
						<OverviewLinkButton
							size="compact"
							variant="secondary"
							href={ libraryHref }
							shouldUseRouterLink={ shouldUseRouterLink }
						>
							{ __( 'Browse the Library' ) }
						</OverviewLinkButton>
					</HStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
