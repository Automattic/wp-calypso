/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getHttpData, httpData, requestHttpData } from 'state/data-layer/http-data';
import { http } from 'state/data-layer/wpcom-http/actions';
import Dialog from 'components/dialog';
import { connect } from 'react-redux';
import { getSelectedSiteId } from 'state/ui/selectors';
import { successNotice } from 'state/notices/actions';

const requestId = siteId => `restore-db-password-${ siteId }`;

export const restoreDatabasePassword = siteId =>
	requestHttpData(
		requestId( siteId ),
		http(
			{
				method: 'POST',
				path: `/sites/${ siteId }/hosting/restore-database-password`,
				apiNamespace: 'wpcom/v2',
				body: {},
			},
			{}
		),
		{
			fromApi: () => () => [ [ requestId( siteId ), null ] ],
			freshness: 0,
		}
	);

const RestorePasswordDialog = ( {
	isVisible,
	onRestore,
	onCancel,
	isRestoring,
	hasRestored,
	siteId,
	translate,
	showSuccessNotice,
	reset,
} ) => {
	if ( hasRestored ) {
		reset();
		showSuccessNotice( translate( 'Your database password has been restored.' ), {
			duration: 3000,
		} );
		onRestore();
	}

	const buttons = [
		{
			action: 'restore',
			label: translate( 'Restore' ),
			onClick: () => restoreDatabasePassword( siteId ),
			isPrimary: true,
			disabled: isRestoring,
			additionalClassNames: isRestoring ? 'is-busy' : '',
		},
		{
			action: 'cancel',
			label: translate( 'Cancel' ),
			onClick: onCancel,
			disabled: isRestoring,
		},
	];
	return (
		<Dialog
			isVisible={ isVisible }
			buttons={ buttons }
			onClose={ onCancel }
			shouldCloseOnEsc={ ! isRestoring }
		>
			<h1>{ translate( 'Restore database password' ) }</h1>
			<p>
				{ translate( 'Are you sure you want to restore the default password of your database?' ) }
			</p>
		</Dialog>
	);
};

const mapState = state => {
	const siteId = getSelectedSiteId( state );
	const request = getHttpData( requestId( siteId ) );
	return {
		isRestoring: request.state === 'pending',
		hasRestored: request.state === 'success',
		siteId,
	};
};

const mapDispatch = {
	showSuccessNotice: successNotice,
};

const mergeProps = ( stateProps, dispatchProps, ownProps ) => ( {
	...ownProps,
	...stateProps,
	...dispatchProps,
	reset: () => httpData.set( requestId( stateProps.siteId ), httpData.empty ),
} );

export default connect(
	mapState,
	mapDispatch,
	mergeProps
)( localize( RestorePasswordDialog ) );
