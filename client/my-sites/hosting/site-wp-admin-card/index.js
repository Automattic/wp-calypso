/* eslint-disable wpcalypso/jsx-gridicon-size */
import { Card, Gridicon } from '@automattic/components';
import { useTranslate, localize } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormRadio from 'calypso/components/forms/form-radio';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, removeNotice, successNotice } from 'calypso/state/notices/actions';
import { getSiteOption } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useSiteInterfaceMutation } from './use-select-interface-mutation';
const successNoticeId = 'admin-interface-change-success';
const failureNoticeId = 'admin-interface-change-failure';

const SiteWpAdminCard = ( { siteId, adminInterface } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const removeAllNotices = () => {
		dispatch( removeNotice( successNoticeId ) );
		dispatch( removeNotice( failureNoticeId ) );
	};

	const setSiteInterface = useSiteInterfaceMutation( siteId, {
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
		// Toggle the site interface
		setSiteInterface( { value } );
		// Toggle the local state
		setSelectedAdminInterface( value );
	};

	useEffect( () => {
		if ( adminInterface ) {
			setSelectedAdminInterface( adminInterface );
		}
	}, [ adminInterface ] );

	return (
		<Card className="sitewpadmin-card">
			<Gridicon icon="my-sites" size={ 32 } />
			<CardHeading id="sitewpadmin-card" size={ 20 }>
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
					<FormRadio
						className="staging-site-sync-card__radio"
						label={ translate( 'Default style' ) }
						value="calypso"
						checked={ selectedAdminInterface === 'calypso' }
						onChange={ ( event ) => handleInputChange( event.target.value ) }
					/>
				</FormLabel>
				<FormSettingExplanation>
					{ translate( 'The WordPress.com redesign for a better experience.' ) }
				</FormSettingExplanation>
			</FormFieldset>
			<FormFieldset>
				<FormLabel>
					<FormRadio
						className="staging-site-sync-card__radio"
						label={ translate( 'Classic style' ) }
						value="wp-admin"
						checked={ selectedAdminInterface === 'wp-admin' }
						onChange={ ( event ) => handleInputChange( event.target.value ) }
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
	const adminInterface = getSiteOption( state, siteId, 'wpcom_admin_interface' ) ?? 'calypso';

	return { siteId, adminInterface };
} )( localize( SiteWpAdminCard ) );
