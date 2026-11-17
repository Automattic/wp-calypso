import {
	SelectControl,
	ToggleControl,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { getAvailableLanguages } from '../options';
import TokenSelector from '../token-selector';
import {
	getBudgetLevelOptions,
	getBusinessTypeOptions,
	getCompanySizeOptions,
	getDecisionProcessOptions,
	getHostingEnvironmentOptions,
	getMigrationPlatformOptions,
	getMinimumBudgetOptions,
	getOngoingRelationshipOptions,
	getProjectTypeOptions,
	getRegionOptions,
	getServiceLevelOptions,
	getStoreComplexityOptions,
	getTimingPreferenceOptions,
} from './options';
import type { LeadMatchingFormData } from './form-data';
import type { LeadMatchingSection } from './sections';

type ListField = {
	[ K in keyof LeadMatchingFormData ]: LeadMatchingFormData[ K ] extends string[] ? K : never;
}[ keyof LeadMatchingFormData ];

type ToggleField = {
	[ K in keyof LeadMatchingFormData ]: LeadMatchingFormData[ K ] extends boolean ? K : never;
}[ keyof LeadMatchingFormData ];

interface LeadMatchingSectionFieldsProps {
	section: Exclude< LeadMatchingSection, 'availability' >;
	formData: LeadMatchingFormData;
	onChange: ( fields: Partial< LeadMatchingFormData > ) => void;
}

function SelectField( {
	label,
	help,
	placeholder,
	options,
	value,
	onChange,
}: {
	label: string;
	help?: string;
	placeholder: string;
	options: Record< string, string >;
	value: string;
	onChange: ( value: string ) => void;
} ) {
	return (
		<SelectControl
			__next40pxDefaultSize
			__nextHasNoMarginBottom
			label={ label }
			help={ help }
			value={ value }
			options={ [
				{ value: '', label: placeholder },
				...Object.entries( options ).map( ( [ optionValue, optionLabel ] ) => ( {
					value: optionValue,
					label: optionLabel,
				} ) ),
			] }
			onChange={ onChange }
		/>
	);
}

/**
 * The questions of one lead matching section, in the order and wording of
 * the full lead matching form.
 */
export default function LeadMatchingSectionFields( {
	section,
	formData,
	onChange,
}: LeadMatchingSectionFieldsProps ) {
	const selectAllThatApply = __( 'Select all that apply.' );

	const tokens = (
		field: ListField,
		label: string,
		options: Record< string, string >,
		{ sort = false, help = selectAllThatApply }: { sort?: boolean; help?: string } = {}
	) => {
		return (
			<VStack spacing={ 2 }>
				<TokenSelector
					label={ label }
					help={ help }
					options={ options }
					value={ formData[ field ] }
					sortSuggestions={ sort }
					onChange={ ( value ) => onChange( { [ field ]: value } ) }
				/>
			</VStack>
		);
	};

	const toggle = ( field: ToggleField, label: string ) => (
		<ToggleControl
			__nextHasNoMarginBottom
			label={ label }
			checked={ formData[ field ] }
			onChange={ ( checked ) => onChange( { [ field ]: checked } ) }
		/>
	);

	switch ( section ) {
		case 'regions-and-languages':
			return (
				<>
					{ tokens(
						'regions',
						__( 'Which regions / time zones do you serve?' ),
						getRegionOptions()
					) }
					{ toggle( 'supportsGlobal', __( 'We support global / remote clients' ) ) }
					{ tokens(
						'languages',
						__( 'What languages does your agency support?' ),
						getAvailableLanguages()
					) }
				</>
			);
		case 'business-details':
			return (
				<>
					{ tokens(
						'businessTypes',
						__( 'Which business types does your agency support?' ),
						getBusinessTypeOptions(),
						{ sort: true }
					) }
					{ tokens(
						'idealBusinessTypes',
						__( 'Which business types are an ideal fit for your agency?' ),
						getBusinessTypeOptions(),
						{ sort: true }
					) }
					{ tokens(
						'companySizes',
						__( 'Which company sizes are a good fit for your agency?' ),
						getCompanySizeOptions()
					) }
				</>
			);
		case 'hosting-and-platforms':
			return (
				<>
					{ tokens(
						'hostingEnvironments',
						__( 'Which hosting environments do you regularly work with? (optional)' ),
						getHostingEnvironmentOptions(),
						{ sort: true }
					) }
					{ toggle(
						'supportsHostingRecommendation',
						__( 'We are happy to recommend and move clients to better hosting when needed' )
					) }
					{ tokens(
						'migrationPlatforms',
						__( 'What platforms does your agency typically migrate to WordPress? (optional)' ),
						getMigrationPlatformOptions(),
						{ sort: true }
					) }
					{ tokens(
						'storeComplexities',
						__( 'Which store complexities can your agency support? (optional)' ),
						getStoreComplexityOptions()
					) }
				</>
			);
		case 'website-needs':
			return (
				<>
					{ tokens(
						'projectTypes',
						__( 'Which types of projects do you generally support?' ),
						getProjectTypeOptions(),
						{ sort: true }
					) }
					{ toggle(
						'supportsQuickHelp',
						__( 'We accept one-off small fixes / “quick help” tickets' )
					) }
					<SelectField
						label={ __( 'Which max service level are you most comfortable with right now?' ) }
						help={ __( 'Choose the highest level your agency can realistically support.' ) }
						placeholder={ __( 'Select a maximum service level' ) }
						options={ getServiceLevelOptions() }
						value={ formData.serviceLevels[ 0 ] ?? '' }
						onChange={ ( value ) => onChange( { serviceLevels: value ? [ value ] : [] } ) }
					/>
				</>
			);
		case 'budget-and-timeline':
			return (
				<>
					{ tokens(
						'budgetLevels',
						__( 'What budget levels are typically a good fit for new projects you take on?' ),
						getBudgetLevelOptions()
					) }
					<SelectField
						label={ __( 'What is your minimum budget? (optional)' ) }
						placeholder={ __( 'Select a minimum budget' ) }
						options={ getMinimumBudgetOptions() }
						value={ formData.minimumBudget }
						onChange={ ( value ) => onChange( { minimumBudget: value } ) }
					/>
					{ tokens(
						'timingPreferences',
						__( 'What client start timing works well for you right now?' ),
						getTimingPreferenceOptions(),
						{ help: __( 'Select all that apply and adjust as often as you need to.' ) }
					) }
					{ toggle(
						'supportsHardDeadlines',
						__( 'We can accommodate hard deadlines (events, campaigns, etc.) when needed' )
					) }
				</>
			);
		case 'decision-making':
			return tokens(
				'decisionProcesses',
				__( 'What types of decision-making processes do you work well with?' ),
				getDecisionProcessOptions()
			);
		case 'site-management':
			return (
				<>
					{ tokens(
						'ongoingRelationships',
						__( 'What ongoing relationship do you support?' ),
						getOngoingRelationshipOptions()
					) }
					{ toggle(
						'requiresMaintenance',
						__( 'We require an ongoing maintenance plan for most builds' )
					) }
				</>
			);
	}
}
