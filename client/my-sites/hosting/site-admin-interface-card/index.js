/* eslint-disable wpcalypso/jsx-gridicon-size */
import { Card } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate, localize } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormRadio from 'calypso/components/forms/form-radio';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import InlineSupportLink from 'calypso/components/inline-support-link';
import MaterialIcon from 'calypso/components/material-icon';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, removeNotice, successNotice } from 'calypso/state/notices/actions';
import { getSiteOption } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useSiteInterfaceMutation } from './use-select-interface-mutation';
const successNoticeId = 'admin-interface-change-success';
const failureNoticeId = 'admin-interface-change-failure';

const FormRadioStyled = styled( FormRadio )( {
	'&.form-radio:disabled:checked::before': {
		backgroundColor: 'var(--color-primary)',
		opacity: 0.6,
	},
} );

const SiteAdminInterfaceCard = ( { siteId, adminInterface } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const removeAllNotices = () => {
		dispatch( removeNotice( successNoticeId ) );
		dispatch( removeNotice( failureNoticeId ) );
	};

	const { setSiteInterface, isLoading: isUpdating } = useSiteInterfaceMutation( siteId, {
		onMutate: () => {
			removeAllNotices();
		},
		onSuccess() {
			dispatch(
				successNotice( translate( 'Admin interface style changed.' ), {
					id: successNoticeId,
				} )
			);
		},
		onError: () => {
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
					'Set the style for the admin interface. {{supportLink}}Learn more{{/supportLink}}.',
					{
						components: {
							supportLink: <InlineSupportLink supportContext="dashboard" showIcon={ false } />,
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

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const adminInterface = getSiteOption( state, siteId, 'wpcom_admin_interface' ) || 'calypso';

	return { siteId, adminInterface };
} )( localize( SiteAdminInterfaceCard ) );
