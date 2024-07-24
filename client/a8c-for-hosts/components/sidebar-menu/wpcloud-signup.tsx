import page from '@automattic/calypso-router';
import { chevronLeft } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import Sidebar from '../sidebar';

export default function () {
	const translate = useTranslate();

	return (
		<Sidebar
			path="/wpcloud/signup"
			title={ translate( 'WP Cloud' ) }
			description={ translate( 'Apply to become a WP Cloud partner for full API access.' ) }
			backButtonProps={ {
				label: translate( 'Back to Partner Portal' ),
				icon: chevronLeft,
				onClick: () => {
					page( '/wpcloud/signup' );
				},
			} }
			menuItems={ [] }
			withUserProfileFooter
		/>
	);
}
