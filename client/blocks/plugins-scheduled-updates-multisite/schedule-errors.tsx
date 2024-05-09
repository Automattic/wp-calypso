import { Notice } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import { useErrors } from './hooks/use-errors';

export const ScheduleErrors = () => {
	const { errors, createErrors, updateErrors, deleteErrors, clearErrors } = useErrors();
	const translate = useTranslate();

	if ( errors.length === 0 ) {
		return null;
	}

	const renderErrorList = ( errorList: typeof errors, errorMessage: ReactNode ) => {
		if ( errorList.length === 0 ) {
			return null;
		}

		return (
			<>
				{ errorMessage }
				<ul>
					{ errorList.map( ( error, idx ) => (
						<li key={ `${ error.siteSlug }.${ idx }` }>
							<strong>{ error.site?.title }: </strong> { error.error }
						</li>
					) ) }
				</ul>
			</>
		);
	};

	return (
		<Notice status="warning" isDismissible onDismiss={ () => clearErrors() }>
			{ renderErrorList(
				createErrors,
				translate(
					'An error was encountered while creating the schedule.',
					'Some errors were encountered while creating the schedule.',
					{ count: createErrors.length }
				)
			) }
			{ renderErrorList(
				updateErrors,
				translate(
					'An error was encountered while updating the schedule.',
					'Some errors were encountered while updating the schedule.',
					{ count: updateErrors.length }
				)
			) }
			{ renderErrorList(
				deleteErrors,
				translate(
					'An error was encountered while deleting the schedule.',
					'Some errors were encountered while deleting the schedule.',
					{ count: deleteErrors.length }
				)
			) }
		</Notice>
	);
};
