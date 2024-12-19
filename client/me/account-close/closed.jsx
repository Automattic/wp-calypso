import config from '@automattic/calypso-config';
import { Button, Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BlankCanvas } from 'calypso/components/blank-canvas';
import FormattedHeader from 'calypso/components/formatted-header';
import { restoreAccount } from 'calypso/state/account/actions';
import { getIsRestoring, getRestoreToken } from 'calypso/state/account/selectors';
import isAccountClosed from 'calypso/state/selectors/is-account-closed';

import './closed.scss';

function AccountDeletedPage() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const isRestoring = useSelector( getIsRestoring );
	const isUserAccountClosed = useSelector( isAccountClosed );

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

	const onCancelClick = () => {
		window.location.href = '/';
	};

	const onRestoreClick = () => {
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
					<Button variant="secondary" onClick={ onCancelClick }>
						{ translate( 'Return to WordPress.com' ) }
					</Button>
					{ config.isEnabled( 'me/account-restore' ) && (
						<Button
							variant="link"
							className="account-deleted__button-link"
							onClick={ onRestoreClick }
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

export default AccountDeletedPage;
