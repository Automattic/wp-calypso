import {
	SelectControl,
	ToggleControl,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Text } from '../../../components/text';
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
import type { LeadMatchingSection, LeadMatchingValidationErrors } from './sections';

type ListField = {
	[ K in keyof LeadMatchingFormData ]: LeadMatchingFormData[ K ] extends string[] ? K : never;
}[ keyof LeadMatchingFormData ];

type ToggleField = {
	[ K in keyof LeadMatchingFormData ]: LeadMatchingFormData[ K ] extends boolean ? K : never;
}[ keyof LeadMatchingFormData ];

interface Props {
	section: Exclude< LeadMatchingSection, 'availability' >;
	formData: LeadMatchingFormData;
	errors: LeadMatchingValidationErrors;
	onChange: ( fields: Partial< LeadMatchingFormData > ) => void;
}

/**
 * The questions of one lead matching section, in the order and wording of
 * the full lead matching form.
 */
export default function LeadMatchingSectionFields( {
	section,
	formData,
	errors,
	onChange,
}: Props ) {
	const selectAllThatApply = __( 'Select all that apply.' );

	const tokens = (
		field: ListField,
		label: string,
		options: Record< string, string >,
		{ sort = false, help = selectAllThatApply }: { sort?: boolean; help?: string } = {}
	) => {
		const error = errors[ field as keyof LeadMatchingValidationErrors ];

		return (
			<VStack spacing={ 2 } data-field-name={ field }>
				<TokenSelector
					label={ label }
					help={ help }
					options={ options }
					value={ formData[ field ] }
					sortSuggestions={ sort }
					onChange={ ( value ) => onChange( { [ field ]: value } ) }
				/>
				{ error && <Text intent="error">{ error }</Text> }
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

	const select = (
		field: 'serviceLevels' | 'minimumBudget',
		label: string,
		help: string | undefined,
		placeholder: string,
		options: Record< string, string >
	) => {
		const error = errors[ field as keyof LeadMatchingValidationErrors ];
		const value =
			field === 'serviceLevels' ? ( formData.serviceLevels[ 0 ] ?? '' ) : formData[ field ];

		return (
			<VStack spacing={ 2 } data-field-name={ field }>
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
					onChange={ ( next ) =>
						onChange(
							field === 'serviceLevels'
								? { serviceLevels: next ? [ next ] : [] }
								: { minimumBudget: next }
						)
					}
				/>
				{ error && <Text intent="error">{ error }</Text> }
			</VStack>
		);
	};

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
					{ select(
						'serviceLevels',
						__( 'Which max service level are you most comfortable with right now?' ),
						__( 'Choose the highest level your agency can realistically support.' ),
						__( 'Select a maximum service level' ),
						getServiceLevelOptions()
					) }
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
					{ select(
						'minimumBudget',
						__( 'What is your minimum budget? (optional)' ),
						undefined,
						__( 'Select a minimum budget' ),
						getMinimumBudgetOptions()
					) }
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
