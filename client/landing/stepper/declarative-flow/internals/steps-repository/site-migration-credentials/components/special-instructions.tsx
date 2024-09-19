import { useHasEnTranslation } from '@automattic/i18n-utils';
import { Button, Icon } from '@wordpress/components';
import { chevronDown, chevronUp } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { Controller, Control } from 'react-hook-form';
import FormTextArea from 'calypso/components/forms/form-textarea';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { CredentialsFormData } from '../types';
import { ErrorMessage } from './error-message';

interface Props {
	control: Control< CredentialsFormData >;
	errors: any;
}

export const SpecialInstructions: React.FC< Props > = ( { control, errors } ) => {
	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();
	const [ showNotes, setShowNotes ] = useState( false );

	const toggleShowNotes = () => {
		setShowNotes( ! showNotes );
		recordTracksEvent( 'calypso_site_migration_special_instructions_toggle', {
			show_notes: ! showNotes,
		} );
	};

	const placeholder = hasEnTranslation(
		'Share any other details that will help us access your site for the migration'
	)
		? translate( 'Share any other details that will help us access your site for the migration' )
		: translate( 'Share any other details that will help us access your site for the migration.' );

	return (
		<div className="site-migration-credentials__special-instructions">
			<Button onClick={ () => toggleShowNotes() } data-testid="special-instructions">
				{ translate( 'Special instructions' ) }
				<Icon
					icon={ showNotes ? chevronUp : chevronDown }
					size={ 24 }
					className="site-migration-credentials__special-instructions-icon"
				/>
			</Button>
			{ showNotes && (
				<>
					<div className="site-migration-credentials__form-field site-migration-credentials__form-field--notes">
						<Controller
							control={ control }
							name="notes"
							render={ ( { field } ) => (
								<FormTextArea
									id="notes"
									type="text"
									data-testid="special-instructions-textarea"
									maxLength={ 1000 }
									placeholder={ placeholder }
									{ ...field }
									ref={ null }
								/>
							) }
						/>
					</div>
					<ErrorMessage error={ errors.notes } />
					<div className="site-migration-credentials__form-note">
						{ translate(
							"Please don't share any passwords or secure information in this field. We'll reach out to collect that information if you have any additional credentials to access your site."
						) }
					</div>
				</>
			) }
		</div>
	);
};
