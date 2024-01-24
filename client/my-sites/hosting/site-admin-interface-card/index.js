/* eslint-disable wpcalypso/jsx-gridicon-size */
import { Card } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate, localize } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormRadio from 'calypso/components/forms/form-radio';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import InlineSupportLink from 'calypso/components/inline-support-link';
import MaterialIcon from 'calypso/components/material-icon';
import { useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	errorNotice,
	plainNotice,
	removeNotice,
	successNotice,
} from 'calypso/state/notices/actions';
import { getSiteOption } from 'calypso/state/sites/selectors';
import { useSiteInterfaceMutation } from './use-select-interface-mutation';

const changeLoadingNoticeId = 'admin-interface-change-loading';
const successNoticeId = 'admin-interface-change-success';
const failureNoticeId = 'admin-interface-change-failure';

const FormRadioStyled = styled( FormRadio )( {
	'&.form-radio:disabled:checked::before': {
		backgroundColor: 'var(--color-primary)',
		opacity: 0.6,
	},
} );

const SiteAdminInterfaceCard = ( { siteId } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const removeAllNotices = () => {
		dispatch( removeNotice( successNoticeId ) );
		dispatch( removeNotice( failureNoticeId ) );
		dispatch( removeNotice( changeLoadingNoticeId ) );
	};
	const adminInterface = useSelector( ( state ) =>
		getSiteOption( state, siteId, 'wpcom_admin_interface' )
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

	// Initialize the state with the value passed as a prop
	const [ selectedAdminInterface, setSelectedAdminInterface ] = useState(
		adminInterface ?? 'calypso'
	);

	const handleInputChange = async ( value ) => {
		dispatch(
			recordTracksEvent( 'calypso_hosting_configuration_admin_interface_change', {
				interface: value,
			} )
		);
		setSiteInterface( value );
		setSelectedAdminInterface( value );
	};

	useEffect( () => {
		if ( adminInterface ) {
			setSelectedAdminInterface( adminInterface );
		}
	}, [ adminInterface ] );

	return (
		<Card>
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
								<InlineSupportLink supportContext="admin-interface-style" showIcon={ false } />
							),
						},
					}
				) }
			</p>

			<FormFieldset>
				<FormLabel>
					<FormRadioStyled
						label={ translate( 'Default style' ) }
						value="calypso"
						checked={ selectedAdminInterface === 'calypso' }
						onChange={ ( event ) => handleInputChange( event.target.value ) }
						disabled={ isUpdating }
					/>
				</FormLabel>
				<FormSettingExplanation>
					{ translate( 'The WordPress.com redesign for a better experience.' ) }
				</FormSettingExplanation>
			</FormFieldset>
			<FormFieldset>
				<FormLabel>
					<FormRadioStyled
						label={ translate( 'Classic style' ) }
						value="wp-admin"
						checked={ selectedAdminInterface === 'wp-admin' }
						onChange={ ( event ) => handleInputChange( event.target.value ) }
						disabled={ isUpdating }
					/>
				</FormLabel>
				<FormSettingExplanation>
					{ translate( 'The classic WP-Admin WordPress interface.' ) }
				</FormSettingExplanation>
			</FormFieldset>
		</Card>
	);
};

export default localize( SiteAdminInterfaceCard );
