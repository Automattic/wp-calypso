import { CheckboxControl, TextareaControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { getStatsOptions } from '../../../lib/stat-options';
import type { StepProps } from './types';

export default function Step2Content( { formData, state, handlers }: StepProps ) {
	const translate = useTranslate();

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
			setStatsCheckedItems( {
				...statsCheckedItems,
				[ itemName ]: ! statsCheckedItems[ itemName ],
			} );
		},
		[ statsCheckedItems, setStatsCheckedItems ]
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
				onChange={ setCustomIntroText }
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
