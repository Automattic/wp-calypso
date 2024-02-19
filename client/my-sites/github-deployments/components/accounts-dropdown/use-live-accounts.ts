import config from '@automattic/calypso-config';
import { useLayoutEffect, useState } from 'react';
import { GitHubAccountData, useGithubAccountsQuery } from '../../use-github-accounts-query';
import { openPopup } from '../../utils/open-popup';

interface UseLiveAccountsParameters {
	initialAccountId?: number;
}

const APP_SLUG = config( 'github_app_slug' );
const INSTALL_APP_URL = `https://github.com/apps/${ APP_SLUG }/installations/new`;

const POPUP_ID = 'github-app-install';

export const useLiveAccounts = ( { initialAccountId }: UseLiveAccountsParameters ) => {
	const { data: accounts = [], refetch, isLoading: isLoadingAccounts } = useGithubAccountsQuery();

	const [ account, setAccount ] = useState< GitHubAccountData >();

	useLayoutEffect( () => {
		if ( accounts.length === 0 || account ) {
			return;
		}

		if ( initialAccountId ) {
			const preselectedAccount = accounts.find(
				( account ) => account.external_id === initialAccountId
			);

			if ( preselectedAccount ) {
				setAccount( preselectedAccount );
				return;
			}
		}

		setAccount( accounts[ 0 ] );
	}, [ accounts, account, initialAccountId ] );

	const onNewInstallationRequest = () => {
		openPopup< { installationId: number } >( {
			url: INSTALL_APP_URL,
			popupId: POPUP_ID,
			expectedEvent: 'github-app-installed',
		} )
			.then( async ( { installationId } ) => {
				const { data: newAccounts } = await refetch();

				const newInstallation = newAccounts?.find(
					( account ) => account.external_id === installationId
				);

				if ( newInstallation ) {
					setAccount( newInstallation );
				}
			} )
			.catch( () => {
				/**
				 * Do nothing. On installation updates, the user isn't redirected to our callback,
				 * so we can't check whether the action succeeded or failed in this case.
				 */
			} );
	};

	return {
		account,
		onNewInstallationRequest,
		setAccount,
		accounts,
		isLoadingAccounts,
	};
};
