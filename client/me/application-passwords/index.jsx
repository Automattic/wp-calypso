import { Button, CompactCard, Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import InlineSupportLink from 'calypso/components/inline-support-link';
import SectionHeader from 'calypso/components/section-header';
import useAppPasswordsQuery from 'calypso/data/application-passwords/use-app-passwords-query';
import useCreateAppPasswordMutation from 'calypso/data/application-passwords/use-create-app-password-mutation';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import NewAppPasswordForm from './form';
import AppPasswordsList from './list.jsx';
import NewAppPassword from './new-password';
import './style.scss';

function ApplicationPasswords() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ applicationName, setApplicationName ] = useState( '' );
	const [ showAddPasswordForm, setShowAddPasswordForm ] = useState( false );

	const isMobile = useMobileBreakpoint();

	const { data: appPasswords } = useAppPasswordsQuery();
	const {
		createApplicationPassword,
		isLoading: isCreatingAppPassword,
		data: newAppPasswordData,
		reset: clearNewApplicationPassword,
	} = useCreateAppPasswordMutation( {
		onError() {
			dispatch(
				errorNotice(
					translate( 'There was a problem creating your application password. Please try again.' ),
					{
						duration: 8000,
					}
				)
			);
		},
	} );

	const newAppPassword = newAppPasswordData?.application_password;

	const getClickHandler = ( action, callback ) => ( event ) => {
		dispatch( recordGoogleEvent( 'Me', `Clicked on ${ action }` ) );
		callback?.( event );
	};

	return (
		<div className="application-passwords">
			<SectionHeader label={ translate( 'Application passwords' ) }>
				{ ! newAppPassword && (
					<Button
						compact
						onClick={ getClickHandler( 'Create Application Password Button', () =>
							setShowAddPasswordForm( ! showAddPasswordForm )
						) }
					>
						{ /* eslint-disable wpcalypso/jsx-gridicon-size */ }
						<Gridicon icon="plus-small" size={ 16 } />
						{ /* eslint-enable wpcalypso/jsx-gridicon-size */ }
						{ isMobile
							? translate( 'Add New', { context: 'application password' } )
							: translate( 'Add new application password' ) }
					</Button>
				) }
			</SectionHeader>
			<CompactCard>
				{ newAppPassword ? (
					<NewAppPassword
						newAppPassword={ newAppPassword }
						appName={ applicationName }
						onClickDone={ getClickHandler( 'New Application Password Done Button', () => {
							clearNewApplicationPassword();
							setApplicationName( '' );
							setShowAddPasswordForm( false );
						} ) }
					/>
				) : (
					<NewAppPasswordForm
						isSubmitting={ isCreatingAppPassword }
						addingPassword={ showAddPasswordForm }
						onSubmit={ ( appName ) => {
							createApplicationPassword( appName );
							setApplicationName( appName );
						} }
						onClickGenerate={ getClickHandler( 'Generate New Application Password Button' ) }
						onClickCancel={ getClickHandler(
							'Cancel Generate New Application Password Button',
							() => setShowAddPasswordForm( ! showAddPasswordForm )
						) }
					/>
				) }

				{ ! newAppPassword && (
					<FormSettingExplanation className="application-passwords__explanation">
						<>
							{ translate(
								'With Two-Step Authentication active, you can generate a custom password for ' +
									'each third-party application you authorize to use your WordPress.com account. ' +
									'You can revoke access for an individual application here if you ever need to.'
							) }{ ' ' }
							<InlineSupportLink
								supportPostId={ 263616 }
								showIcon={ false }
								supportLink={ localizeUrl(
									'https://wordpress.com/support/security/two-step-authentication/application-specific-passwords'
								) }
							/>
						</>
					</FormSettingExplanation>
				) }
			</CompactCard>

			{ ! showAddPasswordForm && ! newAppPassword && (
				<AppPasswordsList appPasswords={ appPasswords } />
			) }
		</div>
	);
}

export default ApplicationPasswords;
