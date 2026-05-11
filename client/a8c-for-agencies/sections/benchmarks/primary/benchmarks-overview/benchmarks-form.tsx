import { Button, CheckboxControl, SelectControl, TextControl } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useCallback, useMemo, useState } from 'react';
import Form from 'calypso/a8c-for-agencies/components/form';
import FormField from 'calypso/a8c-for-agencies/components/form/field';
import FormFooter from 'calypso/a8c-for-agencies/components/form/footer';
import FormSection from 'calypso/a8c-for-agencies/components/form/section';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLegend from 'calypso/components/forms/form-legend';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import {
	getAiToolsOptions,
	getAiUseCasesOptions,
	getGovernanceMaturityOptions,
	getKpiFieldConfig,
	getStakeholderDemandOptions,
	KPI_FIELDS,
	type AgencyBenchmarkSubmission,
	type AiTool,
	type AiUseCase,
	type GovernanceMaturity,
	type KpiField,
	type StakeholderDemand,
} from '../../constants';
import useSubmitAgencyBenchmark from '../../hooks/use-submit-agency-benchmark';

type Props = {
	quarter: 1 | 2 | 3 | 4;
	year: number;
	hideHeader?: boolean;
	onSubmitSuccess?: () => void;
};

type KpiState = Record< KpiField, string >;
type FieldErrors = Partial<
	Record< KpiField | 'governance_maturity' | 'stakeholder_demand', string >
>;

const emptyKpiState = (): KpiState =>
	KPI_FIELDS.reduce( ( acc, key ) => {
		acc[ key ] = '';
		return acc;
	}, {} as KpiState );

export default function BenchmarksForm( { quarter, year, hideHeader, onSubmitSuccess }: Props ) {
	const dispatch = useDispatch();
	const kpiConfig = useMemo( () => getKpiFieldConfig(), [] );
	const governanceOptions = useMemo( () => getGovernanceMaturityOptions(), [] );
	const stakeholderOptions = useMemo( () => getStakeholderDemandOptions(), [] );
	const aiToolsOptions = useMemo( () => getAiToolsOptions(), [] );
	const aiUseCasesOptions = useMemo( () => getAiUseCasesOptions(), [] );

	const [ kpis, setKpis ] = useState< KpiState >( emptyKpiState );
	const [ governance, setGovernance ] = useState< GovernanceMaturity | '' >( '' );
	const [ stakeholder, setStakeholder ] = useState< StakeholderDemand | '' >( '' );
	const [ aiTools, setAiTools ] = useState< AiTool[] >( [] );
	const [ aiUseCases, setAiUseCases ] = useState< AiUseCase[] >( [] );
	const [ errors, setErrors ] = useState< FieldErrors >( {} );

	const setKpi = useCallback( ( field: KpiField, value: string ) => {
		setKpis( ( prev ) => ( { ...prev, [ field ]: value } ) );
		setErrors( ( prev ) => ( { ...prev, [ field ]: undefined } ) );
	}, [] );

	const toggleAiTool = useCallback( ( value: AiTool ) => {
		setAiTools( ( prev ) =>
			prev.includes( value ) ? prev.filter( ( v ) => v !== value ) : [ ...prev, value ]
		);
	}, [] );

	const toggleAiUseCase = useCallback( ( value: AiUseCase ) => {
		setAiUseCases( ( prev ) =>
			prev.includes( value ) ? prev.filter( ( v ) => v !== value ) : [ ...prev, value ]
		);
	}, [] );

	const submitMutation = useSubmitAgencyBenchmark( {
		onSuccess: () => {
			dispatch(
				successNotice(
					sprintf(
						/* translators: %1$d: quarter number, %2$d: year. */
						__( 'Your Q%1$d %2$d benchmarks have been submitted.' ),
						quarter,
						year
					),
					{ id: 'a4a-benchmark-submit-success', duration: 5000 }
				)
			);
			dispatch( recordTracksEvent( 'calypso_a4a_benchmarks_submit_success' ) );
			onSubmitSuccess?.();
		},
		onError: ( error ) => {
			dispatch( errorNotice( error.message, { id: 'a4a-benchmark-submit-error' } ) );
			dispatch(
				recordTracksEvent( 'calypso_a4a_benchmarks_submit_error', {
					error_code: error.code,
				} )
			);
		},
	} );

	const validate = useCallback( (): {
		ok: boolean;
		errors: FieldErrors;
		payload?: AgencyBenchmarkSubmission;
	} => {
		const nextErrors: FieldErrors = {};
		const numericValues = {} as Record< KpiField, number >;

		for ( const field of KPI_FIELDS ) {
			const raw = kpis[ field ];
			if ( raw === '' ) {
				nextErrors[ field ] = __( 'This field is required.' );
				continue;
			}
			const parsed = Number( raw );
			if ( ! Number.isFinite( parsed ) ) {
				nextErrors[ field ] = __( 'Enter a valid number.' );
				continue;
			}
			const config = kpiConfig[ field ];
			if ( config.isInteger && ! Number.isInteger( parsed ) ) {
				nextErrors[ field ] = __( 'Enter a whole number.' );
				continue;
			}
			if ( parsed < config.min ) {
				nextErrors[ field ] = sprintf(
					/* translators: %d: minimum allowed value. */
					__( 'Value must be at least %d.' ),
					config.min
				);
				continue;
			}
			if ( config.max !== undefined && parsed > config.max ) {
				nextErrors[ field ] = sprintf(
					/* translators: %d: maximum allowed value. */
					__( 'Value must be at most %d.' ),
					config.max
				);
				continue;
			}
			numericValues[ field ] = parsed;
		}

		if ( ! governance ) {
			nextErrors.governance_maturity = __( 'Please choose an option.' );
		}
		if ( ! stakeholder ) {
			nextErrors.stakeholder_demand = __( 'Please choose an option.' );
		}

		const ok = Object.values( nextErrors ).every( ( v ) => ! v );
		if ( ! ok || ! governance || ! stakeholder ) {
			return { ok: false, errors: nextErrors };
		}

		return {
			ok: true,
			errors: nextErrors,
			payload: {
				quarter,
				year,
				...numericValues,
				governance_maturity: governance,
				stakeholder_demand: stakeholder,
				ai_tools_used: aiTools,
				ai_use_cases: aiUseCases,
			},
		};
	}, [ aiTools, aiUseCases, governance, kpiConfig, kpis, quarter, stakeholder, year ] );

	const onSubmit = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_benchmarks_submit', { quarter, year } ) );
		const result = validate();
		setErrors( result.errors );
		if ( ! result.ok || ! result.payload ) {
			return;
		}
		submitMutation.mutate( result.payload );
	}, [ dispatch, quarter, submitMutation, validate, year ] );

	const isPending = submitMutation.isPending;

	const renderKpi = ( field: KpiField ) => {
		const config = kpiConfig[ field ];
		return (
			<FormField label={ config.label } error={ errors[ field ] } isRequired>
				<TextControl
					__nextHasNoMarginBottom
					type="number"
					min={ config.min }
					max={ config.max }
					step={ config.step }
					value={ kpis[ field ] }
					onChange={ ( value ) => setKpi( field, value ) }
					disabled={ isPending }
				/>
			</FormField>
		);
	};

	return (
		<Form
			className="benchmarks-form"
			title={
				hideHeader
					? undefined
					: sprintf(
							/* translators: %1$d: quarter number, %2$d: year. Example: Submit Q1 2026 numbers. */
							__( 'Submit Q%1$d %2$d numbers' ),
							quarter,
							year
					  )
			}
		>
			<FormSection title={ __( 'Business performance' ) }>
				<div className="benchmarks-form__row">
					{ renderKpi( 'gross_margin' ) }
					{ renderKpi( 'billable_utilization' ) }
				</div>
				<div className="benchmarks-form__row">
					{ renderKpi( 'avg_project_size_usd' ) }
					{ renderKpi( 'win_rate' ) }
				</div>
				<div className="benchmarks-form__row">
					{ renderKpi( 'retainer_mrr_usd' ) }
					{ renderKpi( 'avg_time_to_close_days' ) }
				</div>
				<div className="benchmarks-form__row">{ renderKpi( 'client_retention' ) }</div>
			</FormSection>

			<FormSection title={ __( 'AI adoption & maturity' ) }>
				<div className="benchmarks-form__row">
					{ renderKpi( 'ai_work_involvement' ) }
					{ renderKpi( 'ai_revenue_percentage' ) }
				</div>
				<div className="benchmarks-form__row">
					{ renderKpi( 'ai_productivity_lift' ) }
					{ renderKpi( 'team_ai_training_percentage' ) }
				</div>

				<div className="benchmarks-form__row">
					<FormField
						label={ __( 'Governance maturity' ) }
						error={ errors.governance_maturity }
						isRequired
					>
						<SelectControl
							__nextHasNoMarginBottom
							value={ governance }
							options={ [ { value: '', label: __( 'Select an option' ) }, ...governanceOptions ] }
							onChange={ ( value ) => {
								setGovernance( value as GovernanceMaturity );
								setErrors( ( prev ) => ( { ...prev, governance_maturity: undefined } ) );
							} }
							disabled={ isPending }
						/>
					</FormField>
					<FormField
						label={ __( 'Demand from stakeholders' ) }
						error={ errors.stakeholder_demand }
						isRequired
					>
						<SelectControl
							__nextHasNoMarginBottom
							value={ stakeholder }
							options={ [ { value: '', label: __( 'Select an option' ) }, ...stakeholderOptions ] }
							onChange={ ( value ) => {
								setStakeholder( value as StakeholderDemand );
								setErrors( ( prev ) => ( { ...prev, stakeholder_demand: undefined } ) );
							} }
							disabled={ isPending }
						/>
					</FormField>
				</div>

				<FormFieldset className="benchmarks-form__checkbox-group">
					<FormLegend>{ __( 'AI tools used' ) }</FormLegend>
					<div className="benchmarks-form__checkbox-grid">
						{ aiToolsOptions.map( ( option ) => (
							<CheckboxControl
								__nextHasNoMarginBottom
								key={ option.value }
								label={ option.label }
								checked={ aiTools.includes( option.value ) }
								onChange={ () => toggleAiTool( option.value ) }
								disabled={ isPending }
							/>
						) ) }
					</div>
				</FormFieldset>

				<FormFieldset className="benchmarks-form__checkbox-group">
					<FormLegend>{ __( 'AI use cases' ) }</FormLegend>
					<div className="benchmarks-form__checkbox-grid">
						{ aiUseCasesOptions.map( ( option ) => (
							<CheckboxControl
								__nextHasNoMarginBottom
								key={ option.value }
								label={ option.label }
								checked={ aiUseCases.includes( option.value ) }
								onChange={ () => toggleAiUseCase( option.value ) }
								disabled={ isPending }
							/>
						) ) }
					</div>
				</FormFieldset>
			</FormSection>

			<FormFooter>
				<span className="benchmarks-form__required-information">
					{ __( '* Indicates a required field' ) }
				</span>
				<Button variant="primary" onClick={ onSubmit } disabled={ isPending } isBusy={ isPending }>
					{ __( 'Submit' ) }
				</Button>
			</FormFooter>
		</Form>
	);
}
