/* eslint-disable wpcalypso/jsx-gridicon-size */
import { Card, Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { CardBody, ToggleControl } from '@wordpress/components';
import { useTranslate, localize } from 'i18n-calypso';
import { useState } from 'react';
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

export const SiteWpAdminCard = ( { siteId, adminInterface } ) => {
	const translate = useTranslate();

	const toggleSiteInterfaceMutation = useSiteInterfaceMutation( siteId );

	// Define a state to track whether the toggle is checked
	const [ wpAdminEnabled, setWpAdminEnabled ] = useState( false );

	// Define a function to toggle the site interface when the ToggleControl is changed
	const handleToggleChange = async () => {
		await toggleSiteInterfaceMutation();
		setWpAdminEnabled( ! wpAdminEnabled );
	};

	const defaultWpAdminToggleDescription = translate(
		'Default the site interface and navigation to wp-admin'
	);

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
					{ wpAdminEnabled && (
						<div>
							<p>The interface is currently set to: { adminInterface }</p>
						</div>
					) }
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
