import { __ } from '@wordpress/i18n';

export const KPI_FIELDS = [
	'gross_margin',
	'billable_utilization',
	'avg_project_size_usd',
	'win_rate',
	'retainer_mrr_usd',
	'avg_time_to_close_days',
	'client_retention',
	'ai_work_involvement',
	'ai_revenue_percentage',
	'ai_productivity_lift',
	'team_ai_training_percentage',
] as const;

export type KpiField = ( typeof KPI_FIELDS )[ number ];

export type KpiFieldConfig = {
	label: string;
	min: number;
	max?: number;
	step: string;
	isInteger?: boolean;
};

export const getKpiFieldConfig = (): Record< KpiField, KpiFieldConfig > => ( {
	gross_margin: { label: __( 'Gross margin (%)' ), min: 0, max: 100, step: '0.1' },
	billable_utilization: { label: __( 'Billable utilization (%)' ), min: 0, max: 100, step: '0.1' },
	avg_project_size_usd: { label: __( 'Avg project size (USD)' ), min: 0, step: '0.01' },
	win_rate: { label: __( 'Win rate (%)' ), min: 0, max: 100, step: '0.1' },
	retainer_mrr_usd: { label: __( 'Retainer MRR (USD)' ), min: 0, step: '0.01' },
	avg_time_to_close_days: {
		label: __( 'Avg time to close (days)' ),
		min: 0,
		step: '1',
		isInteger: true,
	},
	client_retention: { label: __( 'Client retention (%)' ), min: 0, max: 100, step: '0.1' },
	ai_work_involvement: {
		label: __( '% of work involving AI tools' ),
		min: 0,
		max: 100,
		step: '0.1',
	},
	ai_revenue_percentage: {
		label: __( '% of revenue from AI-related work' ),
		min: 0,
		max: 100,
		step: '0.1',
	},
	ai_productivity_lift: {
		label: __( 'Productivity lift from AI (%)' ),
		min: 0,
		max: 100,
		step: '0.1',
	},
	team_ai_training_percentage: {
		label: __( '% of team with AI training' ),
		min: 0,
		max: 100,
		step: '0.1',
	},
} );

export type GovernanceMaturity =
	| 'none'
	| 'informal_guidelines'
	| 'documented_policy'
	| 'policy_client_contracts_updated'
	| 'full_governance_program_with_audits';

export const getGovernanceMaturityOptions = (): { value: GovernanceMaturity; label: string }[] => [
	{ value: 'none', label: __( 'None' ) },
	{ value: 'informal_guidelines', label: __( 'Informal guidelines' ) },
	{ value: 'documented_policy', label: __( 'Documented policy' ) },
	{
		value: 'policy_client_contracts_updated',
		label: __( 'Policy + client contracts updated' ),
	},
	{
		value: 'full_governance_program_with_audits',
		label: __( 'Full governance program w/ audits' ),
	},
];

export type StakeholderDemand =
	| 'no_client_demand_yet'
	| 'occasional_asks'
	| 'frequent_asks'
	| 'majority_of_new_work'
	| 'all_new_work_is_ai_related';

export const getStakeholderDemandOptions = (): { value: StakeholderDemand; label: string }[] => [
	{ value: 'no_client_demand_yet', label: __( 'No client demand yet' ) },
	{ value: 'occasional_asks', label: __( 'Occasional asks' ) },
	{ value: 'frequent_asks', label: __( 'Frequent asks' ) },
	{ value: 'majority_of_new_work', label: __( 'Majority of new work' ) },
	{ value: 'all_new_work_is_ai_related', label: __( 'All new work is AI-related' ) },
];

export type AiTool =
	| 'claude'
	| 'chatgpt_openai'
	| 'github_copilot'
	| 'cursor'
	| 'gemini'
	| 'midjourney'
	| 'perplexity'
	| 'custom_in_house'
	| 'other';

export const getAiToolsOptions = (): { value: AiTool; label: string }[] => [
	{ value: 'claude', label: __( 'Claude' ) },
	{ value: 'chatgpt_openai', label: __( 'ChatGPT/OpenAI' ) },
	{ value: 'github_copilot', label: __( 'GitHub Copilot' ) },
	{ value: 'cursor', label: __( 'Cursor' ) },
	{ value: 'gemini', label: __( 'Gemini' ) },
	{ value: 'midjourney', label: __( 'Midjourney' ) },
	{ value: 'perplexity', label: __( 'Perplexity' ) },
	{ value: 'custom_in_house', label: __( 'Custom/in-house' ) },
	{ value: 'other', label: __( 'Other' ) },
];

export type AiUseCase =
	| 'ai_strategy_consulting'
	| 'ai_implementation'
	| 'ai_assisted_content'
	| 'ai_automation_workflows'
	| 'custom_ai_ml_development'
	| 'ai_training_for_clients'
	| 'none';

export const getAiUseCasesOptions = (): { value: AiUseCase; label: string }[] => [
	{ value: 'ai_strategy_consulting', label: __( 'AI strategy consulting' ) },
	{ value: 'ai_implementation', label: __( 'AI implementation' ) },
	{ value: 'ai_assisted_content', label: __( 'AI-assisted content' ) },
	{ value: 'ai_automation_workflows', label: __( 'AI automation/workflows' ) },
	{ value: 'custom_ai_ml_development', label: __( 'Custom AI/ML development' ) },
	{ value: 'ai_training_for_clients', label: __( 'AI training for clients' ) },
	{ value: 'none', label: __( 'None' ) },
];

export type AgencyBenchmark = {
	id: number;
	agency_id: number;
	quarter: number;
	year: number;
	gross_margin: number;
	billable_utilization: number;
	avg_project_size_usd: number;
	win_rate: number;
	retainer_mrr_usd: number;
	avg_time_to_close_days: number;
	client_retention: number;
	ai_work_involvement: number;
	ai_revenue_percentage: number;
	ai_productivity_lift: number;
	team_ai_training_percentage: number;
	governance_maturity: GovernanceMaturity;
	stakeholder_demand: StakeholderDemand;
	ai_tools_used: AiTool[];
	ai_use_cases: AiUseCase[];
	created_at: string;
	updated_at: string;
};

export type AgencyBenchmarkSubmission = Omit<
	AgencyBenchmark,
	'id' | 'agency_id' | 'created_at' | 'updated_at'
>;
