import { isEnabled } from '@automattic/calypso-config';
import { FormLabel } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FC } from 'react';
import { Controller } from 'react-hook-form';
import FormRadio from 'calypso/components/forms/form-radio';
import { CredentialsFormFieldProps } from '../types';

export const AccessMethodPicker: FC< CredentialsFormFieldProps > = ( { control } ) => {
	const translate = useTranslate();
	const applicationPasswordEnabled = isEnabled( 'automated-migration/application-password' );
	const credentialsLabel = applicationPasswordEnabled
		? translate( 'WordPress site credentials' )
		: translate( 'WordPress credentials' );

	return (
		<div>
			<FormLabel>{ translate( 'How can we access your site?' ) }</FormLabel>
			<div className="site-migration-credentials__radio">
				<Controller
					control={ control }
					name="migrationType"
					defaultValue="credentials"
					render={ ( { field: { value, ...props } } ) => (
						<FormRadio
							id="site-migration-credentials__radio-credentials"
							htmlFor="site-migration-credentials__radio-credentials"
							label={ credentialsLabel }
							checked={ value === 'credentials' }
							{ ...props }
							value="credentials"
							ref={ null }
						/>
					) }
				/>
			</div>
			<div className="site-migration-credentials__radio">
				<Controller
					control={ control }
					name="migrationType"
					defaultValue="backup"
					render={ ( { field: { value, onBlur, ...props } } ) => (
						<FormRadio
							id="site-migration-credentials__radio-backup"
							htmlFor="site-migration-credentials__radio-backup"
							{ ...props }
							checked={ value === 'backup' }
							value="backup"
							label={ translate( 'Backup file' ) }
							ref={ null }
						/>
					) }
				/>
			</div>
		</div>
	);
};
