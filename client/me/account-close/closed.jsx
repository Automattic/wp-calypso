import config from '@automattic/calypso-config';
import { Button, Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { BlankCanvas } from 'calypso/components/blank-canvas';
import FormattedHeader from 'calypso/components/formatted-header';
import { useSelector } from 'calypso/state';
import { restoreAccount } from 'calypso/state/account/actions';
import { getIsRestoring, getRestoreToken } from 'calypso/state/account/selectors';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import isAccountClosed from 'calypso/state/selectors/is-account-closed';

import './closed.scss';

function AccountSettingsClosedComponent( { isUserAccountClosed } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const isRestoring = useSelector( getIsRestoring );

	// restore token is either in the URL or in the reducer
	const params = new URLSearchParams( window.location.search );
	const urlToken = params.get( 'token' );
	const storedToken = useSelector( getRestoreToken );
	const restoreToken = urlToken || storedToken;

	// Sync token to URL if not already there
	useEffect( () => {
		if ( storedToken && ! urlToken ) {
			const newUrl = new URL( window.location.href );
			newUrl.searchParams.set( 'token', storedToken );
			window.history.replaceState( {}, '', newUrl.toString() );
		}
	}, [ storedToken, urlToken ] );

	const onClick = () => {
		window.location.href = '/';
	};

	const onClickRestore = () => {
		dispatch( restoreAccount( restoreToken ) );
	};

	if ( ( ! isUserAccountClosed && ! config.isEnabled( 'me/account-restore' ) ) || ! restoreToken ) {
		return (
			<BlankCanvas className="account-deleted">
				<BlankCanvas.Header />
				<BlankCanvas.Content>
					<FormattedHeader
						brandFont
						headerText={ translate( 'Your account is being deleted' ) }
						subHeaderText={ <Spinner style={ { width: '32px', height: '32px' } } /> }
					/>
				</BlankCanvas.Content>
			</BlankCanvas>
		);
	}

	return (
		<BlankCanvas className="account-deleted">
			<BlankCanvas.Header>
				<Button variant="link" className="account-deleted__button-link" href="/">
					{ translate( 'Create an account' ) }
				</Button>
			</BlankCanvas.Header>
			<BlankCanvas.Content>
				<FormattedHeader
					brandFont
					headerText={ translate( 'Your account has been deleted' ) }
					subHeaderText={
						config.isEnabled( 'me/account-restore' )
							? translate(
									'Thanks for flying with WordPress.com. You have 30 days to restore your account if you change your mind.'
							  )
							: translate( 'Thanks for flying with WordPress.com.' )
					}
				/>
				<div className="account-deleted__buttons">
					<Button variant="secondary" onClick={ onClick }>
						{ translate( 'Return to WordPress.com' ) }
					</Button>
					{ config.isEnabled( 'me/account-restore' ) && (
						<Button
							variant="link"
							className="account-deleted__button-link"
							onClick={ onClickRestore }
							isBusy={ isRestoring }
						>
							{ translate( 'I made a mistake! Restore my account' ) }
						</Button>
					) }
				</div>
			</BlankCanvas.Content>
		</BlankCanvas>
	);
}

export default connect( ( state ) => {
	return {
		previousRoute: getPreviousRoute( state ),
		isUserAccountClosed: isAccountClosed( state ),
	};
} )( AccountSettingsClosedComponent );
