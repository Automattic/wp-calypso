/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import { connect } from 'react-redux';
import { getSelectedSiteId } from 'state/ui/selectors';
import { restoreDatabasePassword } from 'state/hosting/actions';

const RestorePasswordDialog = ( {
	isVisible,
	onRestore,
	onCancel,
	siteId,
	translate,
	restore,
} ) => {
	const [ shouldRestore, setShouldRestore ] = useState( false );
	useEffect( () => {
		if ( shouldRestore ) {
			restore( siteId );
			onRestore();
		}
	}, [ shouldRestore, siteId ] );

	useEffect( () => {
		if ( isVisible ) {
			setShouldRestore( false ); // Reset state first when dialog is opened.
		}
	}, [ isVisible ] );

	const buttons = [
		{
			action: 'restore',
			label: translate( 'Restore' ),
			onClick: () => setShouldRestore( true ),
			isPrimary: true,
		},
		{
			action: 'cancel',
			label: translate( 'Cancel' ),
			onClick: onCancel,
		},
	];
	return (
		<Dialog isVisible={ isVisible } buttons={ buttons } onClose={ onCancel }>
			<h1>{ translate( 'Restore database password' ) }</h1>
			<p>
				{ translate( 'Are you sure you want to restore the default password of your database?' ) }
			</p>
		</Dialog>
	);
};

export default connect(
	state => ( {
		siteId: getSelectedSiteId( state ),
	} ),
	{
		restore: restoreDatabasePassword,
	}
)( localize( RestorePasswordDialog ) );
