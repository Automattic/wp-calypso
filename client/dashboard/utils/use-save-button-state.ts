import { useMemo } from '@wordpress/element';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import React from 'react';

export interface UseSaveButtonStateProps {
	isSaving: boolean;
	isSuccess: boolean;
	isDirty: boolean;
}

type SaveButtonProps = Required<Pick<React.ComponentPropsWithoutRef<typeof Button>, 'label' | 'isBusy' | 'disabled'>>;

export function useSaveButtonState( { isSaving, isSuccess, isDirty }: UseSaveButtonStateProps ): SaveButtonProps {
	return useMemo( () => {
		let saveButtonLabel = __( 'Save' ) as string;

		if ( isSaving ) {
			saveButtonLabel = __( 'Saving…' );
		} else if ( isSuccess && ! isDirty ) {
			saveButtonLabel = __( 'Saved!' );
		}

		return {
			label: saveButtonLabel,
			isBusy: isSaving,
			disabled: isSaving || ! isDirty,
		};
	}, [ isSaving, isSuccess, isDirty ] );
}
