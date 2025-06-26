import { CheckboxControl, TextareaControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getStatsOptions } from '../../../lib/stat-options';
import type { StepProps } from './types';

export default function Step2Content( { formData, state, handlers }: StepProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { customIntroText, statsCheckedItems } = formData;

	const { isDuplicateLoading, sendReportMutation, showValidationErrors, validationErrors } = state;

	const { setCustomIntroText, setStatsCheckedItems } = handlers;

	const getFieldError = useCallback(
		( fieldName: string ): string | undefined => {
			if ( ! showValidationErrors ) {
				return undefined;
			}
			return validationErrors.find( ( error ) => error.field === fieldName )?.message;
		},
		[ showValidationErrors, validationErrors ]
	);

	const hasFieldError = useCallback(
		( fieldName: string ): boolean => {
			return (
				showValidationErrors && validationErrors.some( ( error ) => error.field === fieldName )
			);
		},
		[ showValidationErrors, validationErrors ]
	);

	const handleStep2CheckboxChange = useCallback(
		( itemName: string ) => {
			const newValue = ! statsCheckedItems[ itemName ];
			dispatch(
				recordTracksEvent( 'calypso_a4a_reports_stat_option_toggle', {
					option: itemName,
					enabled: newValue,
				} )
			);
			setStatsCheckedItems( {
				...statsCheckedItems,
				[ itemName ]: newValue,
			} );
		},
		[ statsCheckedItems, setStatsCheckedItems, dispatch ]
	);

	const isCreatingReport = sendReportMutation.isPending;
	const isLoadingState = isDuplicateLoading || isCreatingReport;

	const statsOptions = getStatsOptions( translate );

	return (
		<>
			<h2 className="build-report__step-title">
				{ translate( 'Step 2 of 3: Choose report content' ) }
			</h2>

			<TextareaControl
				__nextHasNoMarginBottom
				label={ translate( 'Intro message (optional)' ) }
				value={ customIntroText }
				onChange={ ( value ) => {
					// Only track when user actually adds content (not when clearing)
					if ( value && ! customIntroText ) {
						dispatch( recordTracksEvent( 'calypso_a4a_reports_custom_intro_add' ) );
					}
					setCustomIntroText( value );
				} }
				rows={ 3 }
				help={ translate( 'Add a short note or update for your client.' ) }
				disabled={ isLoadingState }
			/>

			<h3 className="build-report__group-label">{ translate( 'Stats' ) }</h3>
			{ statsOptions.map( ( item ) => (
				<CheckboxControl
					__nextHasNoMarginBottom
					key={ item.value }
					label={ item.label }
					checked={ statsCheckedItems[ item.value ] }
					onChange={ () => handleStep2CheckboxChange( item.value ) }
					disabled={ isLoadingState }
				/>
			) ) }
			{ hasFieldError( 'statsCheckedItems' ) && (
				<div className="build-report__error-message">{ getFieldError( 'statsCheckedItems' ) }</div>
			) }
			<p className="build-report__step-note">
				{ translate( 'Preview, confirm, and send to your client in the next step.' ) }
			</p>
		</>
	);
}
