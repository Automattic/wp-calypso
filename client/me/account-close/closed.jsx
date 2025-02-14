import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BlankCanvas } from 'calypso/components/blank-canvas';
import FormattedHeader from 'calypso/components/formatted-header';
import Loading from 'calypso/components/loading';
import { restoreAccount } from 'calypso/state/account/actions';
import { getIsRestoring, getRestoreToken } from 'calypso/state/account/selectors';
import isAccountDeleting from 'calypso/state/selectors/is-account-deleting';

import './closed.scss';

function AccountDeletedPage() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const isRestoring = useSelector( getIsRestoring );
	const isDeleting = useSelector( isAccountDeleting );

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

	if ( isDeleting ) {
		return <Loading title={ translate( 'Your account is being deleted' ) } />;
	}

	return (
		<BlankCanvas className="account-deleted">
			<BlankCanvas.Header>
				<Button variant="link" className="account-deleted__button-link" href="/start">
					{ translate( 'Create an account' ) }
				</Button>
			</BlankCanvas.Header>
			<BlankCanvas.Content>
				<FormattedHeader
					brandFont
					headerText={ translate( 'Your account has been deleted' ) }
					subHeaderText={ translate(
						'Thanks for flying with WordPress.com. You have 30 days to restore your account if you change your mind.'
					) }
				/>
				<div className="account-deleted__buttons">
					{ restoreToken && (
						<Button variant="secondary" onClick={ onRestoreClick } isBusy={ isRestoring }>
							{ translate( 'I made a mistake! Restore my account' ) }
						</Button>
					) }
					<Button variant="link" onClick={ onCancelClick } className="account-deleted__button-link">
						{ translate( 'Return to WordPress.com' ) }
					</Button>
				</div>
			</BlankCanvas.Content>
		</BlankCanvas>
	);
}

export default AccountDeletedPage;
