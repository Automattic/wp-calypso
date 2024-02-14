import config from '@automattic/calypso-config';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';
import { GitHubAccountData, useGithubAccountsQuery } from '../../use-github-accounts-query';
import { openPopup } from '../../utils/open-popup';

interface UseLiveAccountsParameters {
	initialAccountId?: number;
}

const APP_SLUG = config( 'github_app_slug' );
const INSTALL_APP_URL = `https://github.com/apps/${ APP_SLUG }/installations/new`;
const POPUP_ID = 'github-app-authorize';

export const useLiveAccounts = ( { initialAccountId }: UseLiveAccountsParameters ) => {
	const { __ } = useI18n();
	const { data: accounts = [], refetch } = useGithubAccountsQuery();
	const dispatch = useDispatch();

	const [ account, setAccount ] = useState< GitHubAccountData | undefined >( () => {
		const preselectedInstallation = accounts.find(
			( account ) => account.external_id === initialAccountId
		);

		return preselectedInstallation ?? accounts.at( 0 );
	} );

	const didRequestInstallation = useRef( false );
	const lastAccounts = useRef( accounts );

	useEffect( () => {
		if ( accounts.length < 2 ) {
			setAccount( accounts[ 0 ] );
		}

		if ( didRequestInstallation.current && lastAccounts.current.length !== accounts.length ) {
			const newAccount = accounts.at( -1 );

			if ( newAccount ) {
				setAccount( newAccount );
			}

			didRequestInstallation.current = false;
		}

		lastAccounts.current = accounts;
	}, [ accounts ] );

	const onNewInstallationRequest = () => {
		openPopup( { url: INSTALL_APP_URL, popupId: POPUP_ID } )
			.then( async () => {
				didRequestInstallation.current = true;
				await refetch();
			} )
			.catch( () =>
				dispatch( errorNotice( __( 'Failed to authorize GitHub. Please try again.' ) ) )
			);
	};

	return {
		account,
		onNewInstallationRequest,
		setAccount,
		accounts,
	};
};
