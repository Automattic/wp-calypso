/* eslint-disable wpcalypso/jsx-gridicon-size */
import { Card, Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { CardBody, ToggleControl } from '@wordpress/components';
import { useTranslate, localize } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import { getSiteOption } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useSiteInterfaceMutation } from './use-select-interface-mutation';

const ToggleContainer = styled.div( {
	fontSize: '14px',
	label: {
		fontSize: '14px',
	},
} );

const ToggleLabel = styled.p( {
	marginBottom: '9px',
	fontWeight: 600,
	fontSize: '14px',
} );

const SITE_WP_ADMIN_CARD_STORAGE_KEY = 'siteWpAdminCardToggleState';

export const SiteWpAdminCard = ( { siteId, adminInterface } ) => {
	const translate = useTranslate();

	const toggleSiteInterfaceMutation = useSiteInterfaceMutation( siteId );

	// Initialize the state with the value from localStorage if available, or false if not.
	const [ wpAdminEnabled, setWpAdminEnabled ] = useState(
		localStorage.getItem( SITE_WP_ADMIN_CARD_STORAGE_KEY ) === 'true' || false
	);

	// Define a function to toggle the site interface when the ToggleControl is changed
	const handleToggleChange = async () => {
		// Toggle the site interface
		toggleSiteInterfaceMutation( ! wpAdminEnabled );

		// Toggle the local state
		setWpAdminEnabled( ! wpAdminEnabled );
	};
	const defaultWpAdminToggleDescription = translate(
		'Default the site interface and navigation to wp-admin'
	);

	// Use localStorage to persist the toggle state
	useEffect( () => {
		localStorage.setItem( SITE_WP_ADMIN_CARD_STORAGE_KEY, wpAdminEnabled );
	}, [ wpAdminEnabled ] );

	return (
		<Card className="sitewpadmin-card">
			<Gridicon icon="my-sites" size={ 32 } />
			<CardHeading id="sitewpadmin-card" size={ 20 }>
				{ translate( 'Switch to wp-admin' ) }
			</CardHeading>
			<CardBody>
				<p>{ translate( 'Switch your site interface and navigation to wp-admin.' ) }</p>
				<ToggleContainer>
					<ToggleLabel>{ translate( 'Default to wp-admin' ) }</ToggleLabel>
					<ToggleControl
						label={ defaultWpAdminToggleDescription }
						onChange={ handleToggleChange }
						checked={ wpAdminEnabled }
					/>
					<div>
						{ wpAdminEnabled ? (
							<p>Currently the activated mode is { adminInterface }</p>
						) : (
							<p>Now that the toggle is off, we have activated { adminInterface }.</p>
						) }
					</div>
				</ToggleContainer>
			</CardBody>
		</Card>
	);
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const adminInterface = getSiteOption( state, siteId, 'wpcom_admin_interface' );

	return { siteId, adminInterface };
} )( localize( SiteWpAdminCard ) );
