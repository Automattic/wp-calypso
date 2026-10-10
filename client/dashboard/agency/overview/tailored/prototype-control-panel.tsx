/**
 * PROTOTYPE — proof of concept only.
 *
 * Floating panel, pinned to the bottom left of the Overview, for demoing the
 * tailored experiences: switch between new and established agencies, edit the
 * signup answers that shape the plan, and override the account's status and
 * tier. Changes apply immediately and persist in localStorage.
 */
import {
	Button,
	CheckboxControl,
	SelectControl,
	TextControl,
	__experimentalHStack as HStack,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { chevronDown, cog } from '@wordpress/icons';
import { Card, CardBody, CardDivider, CardHeader } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import { Text } from '../../../components/text';
import { CALL_SCENARIOS, getCallScenarioLabels } from './partner-calls';
import { PARTNER_MANAGERS } from './partner-managers';
import {
	applyQuickScenario,
	resetPrototypeSettings,
	updatePrototypeSettings,
	type ApprovalStatusOverride,
	type QuickScenarioId,
	type PrototypeExperience,
	type TierOverride,
} from './prototype-settings';
import {
	SAMPLE_SIGNUP_PROFILE,
	SIGNUP_GOALS,
	clearSignupProfile,
	saveSignupProfile,
	type SignupGoal,
	type SignupProfile,
} from './signup-profile';
import type { CallScenario } from './partner-calls';
import type { CSSProperties } from 'react';

const AGENCY_SIZES = [ '1-5', '6-10', '11-25', '26-50', '51-100', '101-250', '251+' ];
const MANAGED_SITES = [ '1-5', '6-20', '21-50', '51-100', '101-500', '500+' ];

const getGoalLabels = (): Record< SignupGoal, string > => ( {
	more_leads: __( 'More leads' ),
	passive_income: __( 'Passive income' ),
	better_hosting: __( 'Better hosting' ),
	optimize_operations: __( 'Optimize operations' ),
	other: __( 'Other' ),
} );

const getServiceOptions = () => [
	{ value: 'strategy_consulting', label: __( 'Strategy consulting' ) },
	{ value: 'website_design_development', label: __( 'Design & development' ) },
	{ value: 'performance_optimization', label: __( 'Performance optimization' ) },
	{ value: 'digital_strategy_marketing', label: __( 'Digital marketing' ) },
	{ value: 'ecommerce_development', label: __( 'Ecommerce' ) },
	{ value: 'maintenance_support_plans', label: __( 'Maintenance & support' ) },
	{ value: 'other', label: __( 'Other' ) },
];

const getApprovalOptions = (): { value: ApprovalStatusOverride; label: string }[] => [
	{ value: 'real', label: __( 'Use the real account' ) },
	{ value: 'pending', label: __( 'Pending review' ) },
	{ value: 'approved', label: __( 'Approved' ) },
	{ value: 'rejected', label: __( 'Rejected' ) },
];

const getTierOptions = (): { value: TierOverride; label: string }[] => [
	{ value: 'real', label: __( 'Use the real account' ) },
	{ value: 'emerging-partner', label: __( 'Emerging Partner' ) },
	{ value: 'agency-partner', label: __( 'Agency Partner' ) },
	{ value: 'pro-agency-partner', label: __( 'Pro Partner' ) },
	{ value: 'vip-pro-agency-partner', label: __( 'VIP Pro Partner' ) },
	{ value: 'premier-partner', label: __( 'Premier Partner' ) },
];

const getQuickScenarios = (): { id: QuickScenarioId; title: string; detail: string }[] => [
	{
		id: 'new-emerging',
		title: __( 'New agency' ),
		detail: __( 'Account activated · Advisor call' ),
	},
	{
		id: 'established-pro',
		title: __( 'Established agency' ),
		detail: __( 'Pro Partner · Check-in scheduled' ),
	},
];

const toggle = < T, >( list: T[], value: T ) =>
	list.includes( value ) ? list.filter( ( item ) => item !== value ) : [ ...list, value ];

// Two equal columns, bottom-aligned so a wrapping label doesn't push its field down.
const TWO_COLUMNS: CSSProperties = {
	display: 'grid',
	gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
	gap: '12px',
	alignItems: 'end',
};

const PANEL_POSITION: CSSProperties = {
	position: 'fixed',
	insetInlineStart: '16px',
	insetBlockEnd: '16px',
	zIndex: 1000,
};

function PlanCriteria( { profile }: { profile: SignupProfile | null } ) {
	if ( ! profile ) {
		return (
			<VStack spacing={ 3 }>
				<Text variant="muted" lineHeight="20px">
					{ __( 'No signup answers are saved yet.' ) }
				</Text>
				<HStack spacing={ 2 } justify="flex-start" wrap>
					<Button
						variant="secondary"
						size="compact"
						onClick={ () => saveSignupProfile( SAMPLE_SIGNUP_PROFILE ) }
					>
						{ __( 'Load sample agency' ) }
					</Button>
					<Button variant="tertiary" size="compact" href="/custom-signup">
						{ __( 'Go through signup' ) }
					</Button>
				</HStack>
			</VStack>
		);
	}

	const update = ( changes: Partial< SignupProfile > ) =>
		saveSignupProfile( { ...profile, ...changes } );
	const goalLabels = getGoalLabels();

	return (
		<VStack spacing={ 4 }>
			<div style={ TWO_COLUMNS }>
				<TextControl
					__next40pxDefaultSize
					label={ __( 'First name' ) }
					value={ profile.firstName }
					onChange={ ( firstName ) => update( { firstName } ) }
				/>
				<TextControl
					__next40pxDefaultSize
					label={ __( 'Agency name' ) }
					value={ profile.agencyName }
					onChange={ ( agencyName ) => update( { agencyName } ) }
				/>
			</div>
			<div style={ TWO_COLUMNS }>
				<SelectControl
					__next40pxDefaultSize
					label={ __( 'Team size' ) }
					value={ profile.agencySize }
					options={ AGENCY_SIZES.map( ( size ) => ( { value: size, label: size } ) ) }
					onChange={ ( agencySize ) => update( { agencySize } ) }
				/>
				<SelectControl
					__next40pxDefaultSize
					label={ __( 'Sites managed' ) }
					value={ profile.managedSites }
					options={ MANAGED_SITES.map( ( sites ) => ( { value: sites, label: sites } ) ) }
					onChange={ ( managedSites ) => update( { managedSites } ) }
				/>
			</div>

			<fieldset>
				<VStack spacing={ 2 }>
					<legend>
						<Text weight={ 500 }>{ __( 'Goals' ) }</Text>
					</legend>
					<Text variant="muted" size={ 12 } lineHeight="16px">
						{ __( 'Click in priority order. Unchecking a goal moves the rest up.' ) }
					</Text>
					{ SIGNUP_GOALS.map( ( goal ) => {
						const rank = profile.goals.indexOf( goal ) + 1;
						return (
							<CheckboxControl
								key={ goal }
								label={
									rank
										? sprintf(
												/* translators: 1: priority number, 2: goal name */
												__( '%1$d. %2$s' ),
												rank,
												goalLabels[ goal ]
											)
										: goalLabels[ goal ]
								}
								checked={ rank > 0 }
								onChange={ () => update( { goals: toggle( profile.goals, goal ) } ) }
							/>
						);
					} ) }
					{ profile.goals.includes( 'other' ) && (
						<TextControl
							__next40pxDefaultSize
							label={ __( 'What else they need' ) }
							value={ profile.otherGoal }
							onChange={ ( otherGoal ) => update( { otherGoal } ) }
						/>
					) }
					{ ! profile.goals.length && (
						<Text intent="warning" size={ 12 } lineHeight="16px">
							{ __( 'Pick at least one goal to show the plan.' ) }
						</Text>
					) }
				</VStack>
			</fieldset>

			<fieldset>
				<VStack spacing={ 2 }>
					<legend>
						<Text weight={ 500 }>{ __( 'Services offered' ) }</Text>
					</legend>
					{ getServiceOptions().map( ( service ) => (
						<CheckboxControl
							key={ service.value }
							label={ service.label }
							checked={ profile.servicesOffered.includes( service.value ) }
							onChange={ () =>
								update( { servicesOffered: toggle( profile.servicesOffered, service.value ) } )
							}
						/>
					) ) }
				</VStack>
			</fieldset>

			<HStack spacing={ 2 } justify="flex-start" wrap>
				<Button
					variant="secondary"
					size="compact"
					onClick={ () => saveSignupProfile( SAMPLE_SIGNUP_PROFILE ) }
				>
					{ __( 'Load sample agency' ) }
				</Button>
				<Button variant="tertiary" size="compact" isDestructive onClick={ clearSignupProfile }>
					{ __( 'Clear answers' ) }
				</Button>
			</HStack>
		</VStack>
	);
}

interface PrototypeControlPanelProps {
	isOpen: boolean;
	experience: PrototypeExperience;
	profile: SignupProfile | null;
	approvalStatus: ApprovalStatusOverride;
	tierId: TierOverride;
	partnerManagerId: string;
	callScenario: CallScenario;
	influencedRevenue: number | null;
	/** True when the established agency's tier includes a partner manager. */
	showsPartnerManager: boolean;
}

export default function PrototypeControlPanel( {
	isOpen,
	experience,
	profile,
	approvalStatus,
	tierId,
	partnerManagerId,
	callScenario,
	influencedRevenue,
	showsPartnerManager,
}: PrototypeControlPanelProps ) {
	// Highlights a quick scenario while the controls still match it.
	const activeScenario = ( [ 'new-emerging', 'established-pro' ] as QuickScenarioId[] ).find(
		( id ) =>
			id === 'new-emerging'
				? experience === 'new' && tierId === 'emerging-partner'
				: experience === 'established' &&
					tierId === 'pro-agency-partner' &&
					callScenario === 'scheduled'
	);

	if ( ! isOpen ) {
		return (
			<div style={ PANEL_POSITION }>
				<Button
					variant="primary"
					icon={ cog }
					onClick={ () => updatePrototypeSettings( { isPanelOpen: true } ) }
					style={ { borderRadius: '999px', boxShadow: '0 4px 16px rgb(0 0 0 / 16%)' } }
				>
					{ __( 'Prototype' ) }
				</Button>
			</div>
		);
	}

	return (
		<div
			role="region"
			aria-label={ __( 'Prototype controls' ) }
			style={ {
				...PANEL_POSITION,
				width: '340px',
				maxWidth: 'calc(100vw - 32px)',
				maxHeight: 'calc(100vh - 32px)',
				overflowY: 'auto',
				borderRadius: '8px',
				boxShadow: '0 8px 32px rgb(0 0 0 / 20%)',
			} }
		>
			<Card>
				<CardHeader>
					<SectionHeader
						level={ 3 }
						title={ __( 'Prototype controls' ) }
						actions={
							<Button
								size="compact"
								icon={ chevronDown }
								label={ __( 'Collapse prototype controls' ) }
								onClick={ () => updatePrototypeSettings( { isPanelOpen: false } ) }
							/>
						}
					/>
				</CardHeader>
				<CardBody>
					<VStack spacing={ 2 }>
						<Text weight={ 600 }>{ __( 'Quick scenarios' ) }</Text>
						<Text variant="muted" size={ 12 } lineHeight="16px">
							{ __( 'Sets every control below in one click.' ) }
						</Text>
						{ getQuickScenarios().map( ( scenario ) => (
							<Button
								key={ scenario.id }
								variant={ activeScenario === scenario.id ? 'primary' : 'secondary' }
								size="compact"
								onClick={ () => {
									applyQuickScenario( scenario.id );
									if ( ! profile ) {
										saveSignupProfile( SAMPLE_SIGNUP_PROFILE );
									}
								} }
								style={ { justifyContent: 'flex-start', height: 'auto', paddingBlock: '8px' } }
							>
								<span style={ { display: 'flex', flexDirection: 'column', textAlign: 'start' } }>
									<span style={ { fontWeight: 600 } }>{ scenario.title }</span>
									<span style={ { fontSize: '12px', opacity: 0.8 } }>{ scenario.detail }</span>
								</span>
							</Button>
						) ) }
					</VStack>
				</CardBody>
				<CardDivider />
				<CardBody>
					<VStack spacing={ 3 }>
						<ToggleGroupControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							isBlock
							label={ __( 'Experience' ) }
							value={ experience }
							onChange={ ( value ) =>
								updatePrototypeSettings( { experience: value as PrototypeExperience } )
							}
						>
							<ToggleGroupControlOption value="new" label={ __( 'New agency' ) } />
							<ToggleGroupControlOption value="established" label={ __( 'Established' ) } />
						</ToggleGroupControl>
						<SelectControl
							__next40pxDefaultSize
							label={ __( 'Tier' ) }
							value={ tierId }
							options={ getTierOptions() }
							onChange={ ( value ) => updatePrototypeSettings( { tierId: value as TierOverride } ) }
						/>
						{ experience === 'established' && (
							<Text variant="muted" size={ 12 } lineHeight="16px">
								{ __(
									'Pro tier and above shows a check-in with the partner manager. Lower tiers keep the advisor call.'
								) }
							</Text>
						) }
					</VStack>
				</CardBody>
				<CardDivider />
				<CardBody>
					<VStack spacing={ 3 }>
						<Text weight={ 600 }>{ __( 'Account' ) }</Text>
						<SelectControl
							__next40pxDefaultSize
							label={ __( 'Approval status' ) }
							value={ approvalStatus }
							options={ getApprovalOptions() }
							onChange={ ( value ) =>
								updatePrototypeSettings( { approvalStatus: value as ApprovalStatusOverride } )
							}
						/>
						<TextControl
							__next40pxDefaultSize
							type="number"
							min={ 0 }
							label={ __( 'Influenced revenue (IAR)' ) }
							help={ __( 'Leave blank to use the real account.' ) }
							value={ influencedRevenue === null ? '' : String( influencedRevenue ) }
							onChange={ ( value ) => {
								const amount = Number( value );
								updatePrototypeSettings( {
									influencedRevenue:
										value === '' || ! Number.isFinite( amount ) || amount < 0 ? null : amount,
								} );
							} }
						/>
						{ experience === 'established' && (
							<SelectControl
								__next40pxDefaultSize
								label={ __( 'Partner manager' ) }
								help={
									showsPartnerManager
										? undefined
										: __( 'Pick Pro Partner or higher to show the partner manager.' )
								}
								value={ partnerManagerId }
								options={ PARTNER_MANAGERS.map( ( manager ) => ( {
									value: manager.id,
									label: manager.name,
								} ) ) }
								onChange={ ( value ) => updatePrototypeSettings( { partnerManagerId: value } ) }
							/>
						) }
						{ experience === 'established' && (
							<SelectControl
								__next40pxDefaultSize
								label={ __( 'Check-in status' ) }
								value={ callScenario }
								options={ CALL_SCENARIOS.map( ( scenario ) => ( {
									value: scenario,
									label: getCallScenarioLabels()[ scenario ],
								} ) ) }
								onChange={ ( value ) =>
									updatePrototypeSettings( {
										callScenario: value as CallScenario,
										completedTodoIds: [],
									} )
								}
							/>
						) }
						<HStack justify="flex-start">
							<Button variant="tertiary" size="compact" onClick={ resetPrototypeSettings }>
								{ __( 'Reset controls' ) }
							</Button>
						</HStack>
					</VStack>
				</CardBody>
				{ /* Both experiences use the signup answers for the growth plan. */ }
				<CardDivider />
				<CardBody>
					<VStack spacing={ 3 }>
						<Text weight={ 600 }>{ __( 'Plan criteria' ) }</Text>
						<PlanCriteria profile={ profile } />
					</VStack>
				</CardBody>
			</Card>
		</div>
	);
}
