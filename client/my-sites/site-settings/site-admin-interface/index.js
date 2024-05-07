import { isEnabled } from '@automattic/calypso-config';
/* eslint-disable wpcalypso/jsx-gridicon-size */
import { Card, FormLabel, MaterialIcon } from '@automattic/components';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import styled from '@emotion/styled';
import { useTranslate, localize } from 'i18n-calypso';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormRadio from 'calypso/components/forms/form-radio';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import InfoPopover from 'calypso/components/info-popover';
import InlineSupportLink from 'calypso/components/inline-support-link';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { useSelector } from 'calypso/state';
import { recordTracksEvent, recordGoogleEvent } from 'calypso/state/analytics/actions';
import {
	errorNotice,
	plainNotice,
	removeNotice,
	successNotice,
} from 'calypso/state/notices/actions';
import { getSiteOption } from 'calypso/state/sites/selectors';
import { useSiteInterfaceMutation } from './use-select-interface-mutation';
import './style.scss';
const changeLoadingNoticeId = 'admin-interface-change-loading';
const successNoticeId = 'admin-interface-change-success';
const failureNoticeId = 'admin-interface-change-failure';

const FormRadioStyled = styled( FormRadio )( {
	'&.form-radio:disabled:checked::before': {
		backgroundColor: 'var(--color-primary)',
		opacity: 0.6,
	},
} );

const SiteAdminInterface = ( { siteId, siteSlug, isHosting } ) => {
	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();
	const dispatch = useDispatch();
	const removeAllNotices = () => {
		dispatch( removeNotice( successNoticeId ) );
		dispatch( removeNotice( failureNoticeId ) );
		dispatch( removeNotice( changeLoadingNoticeId ) );
	};

	const adminInterface = useSelector(
		( state ) => getSiteOption( state, siteId, 'wpcom_admin_interface' ) || 'calypso'
	);

	const { setSiteInterface, isLoading: isUpdating } = useSiteInterfaceMutation( siteId, {
		onMutate: () => {
			removeAllNotices();
			dispatch(
				plainNotice( translate( 'Changing admin interface style…' ), {
					id: changeLoadingNoticeId,
					showDismiss: false,
				} )
			);
		},
		onSuccess() {
			dispatch( removeNotice( changeLoadingNoticeId ) );
			dispatch(
				successNotice( translate( 'Admin interface style changed.' ), {
					id: successNoticeId,
				} )
			);
		},
		onError: () => {
			dispatch( removeNotice( changeLoadingNoticeId ) );
			dispatch(
				errorNotice( translate( 'Failed to change admin interface style.' ), {
					id: failureNoticeId,
				} )
			);
		},
	} );

	const [ selectedAdminInterface, setSelectedAdminInterface ] = useState( adminInterface );

	const handleSubmitForm = ( value ) => {
		if ( isHosting ) {
			dispatch(
				recordTracksEvent( 'calypso_hosting_configuration_admin_interface_change', {
					interface: value,
				} )
			);
		} else {
			dispatch(
				recordTracksEvent( 'calypso_site_settings_admin_interface_updated', {
					interface: value,
				} )
			);
		}

		setSiteInterface( value );
	};

	const handleInputChange = async ( value ) => {
		setSelectedAdminInterface( value );
		if ( isHosting ) {
			handleSubmitForm( value );
		} else {
			dispatch( recordGoogleEvent( 'Site Settings', `Set wpcom_admin_interface to ${ value }` ) );
		}
	};

	return (
		<>
			{ ! isHosting && (
				<SettingsSectionHeader
					id="admin-interface-style"
					disabled={ isUpdating }
					isSaving={ isUpdating }
					onButtonClick={ () => handleSubmitForm( selectedAdminInterface ) }
					showButton
					title={ translate(
						'Admin interface style {{infoPopover}} Set the admin interface style for all users. {{supportLink}}Learn more{{/supportLink}}. {{/infoPopover}}',
						{
							components: {
								supportLink: (
									<InlineSupportLink supportContext="admin-interface-style" showIcon={ false } />
								),
								infoPopover: <InfoPopover position="bottom right" />,
							},
							comment: 'The header of the Admin interface style setting',
						}
					) }
				/>
			) }
			<Card>
				{ isHosting && (
					<>
						<MaterialIcon icon="display_settings" style="filled" size={ 32 } />
						<CardHeading id="admin-interface-style" size={ 20 }>
							{ translate( 'Admin interface style' ) }
						</CardHeading>
						<p>
							{ translate(
								'Set the admin interface style for all users. {{supportLink}}Learn more{{/supportLink}}.',
								{
									components: {
										supportLink: (
											<InlineSupportLink
												supportContext="admin-interface-style"
												showIcon={ false }
											/>
										),
									},
								}
							) }
						</p>
						{ isEnabled( 'layout/dotcom-nav-redesign-v2' ) && (
							<p className="form-setting-explanation">
								{ translate( 'This setting has now moved to {{a}}Settings → General{{/a}}.', {
									components: {
										a: (
											<a
												href={ `/settings/general/${ siteSlug }#admin-interface-style` }
												rel="noreferrer"
											/>
										),
									},
								} ) }
							</p>
						) }
					</>
				) }
				{ ( ! isHosting || ! isEnabled( 'layout/dotcom-nav-redesign-v2' ) ) && (
					<>
						<FormFieldset>
							<FormLabel>
								<FormRadioStyled
									label={ translate( 'Classic style' ) }
									name="wpcom_admin_interface"
									value="wp-admin"
									checked={ selectedAdminInterface === 'wp-admin' }
									onChange={ ( event ) => handleInputChange( event.target.value ) }
									disabled={ isUpdating }
								/>
							</FormLabel>
							<FormSettingExplanation>
								{ hasEnTranslation( 'Use WP-Admin to manage your site.' )
									? translate( 'Use WP-Admin to manage your site.' )
									: translate( 'The classic WP-Admin WordPress interface.' ) }
							</FormSettingExplanation>
						</FormFieldset>
						<FormFieldset>
							<FormLabel>
								<FormRadioStyled
									label={ translate( 'Default style' ) }
									name="wpcom_admin_interface"
									value="calypso"
									checked={ selectedAdminInterface === 'calypso' }
									onChange={ ( event ) => handleInputChange( event.target.value ) }
									disabled={ isUpdating }
								/>
							</FormLabel>
							<FormSettingExplanation>
								{ hasEnTranslation( 'Use WordPress.com’s legacy dashboard to manage your site.' )
									? translate( 'Use WordPress.com’s legacy dashboard to manage your site.' )
									: translate( 'The WordPress.com redesign for a better experience.' ) }
							</FormSettingExplanation>
						</FormFieldset>
					</>
				) }
			</Card>
		</>
	);
};

export default localize( SiteAdminInterface );
