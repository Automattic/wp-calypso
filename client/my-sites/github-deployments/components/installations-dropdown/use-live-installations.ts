import config from '@automattic/calypso-config';
import { useLayoutEffect, useState } from 'react';
import {
	GitHubInstallationData,
	useGithubInstallationsQuery,
} from '../../use-github-installations-query';
import { openPopup } from '../../utils/open-popup';

interface UseLiveInstallationsParameters {
	initialInstallationId?: number;
}

const APP_SLUG = config( 'github_app_slug' );
const INSTALL_APP_URL = `https://github.com/apps/${ APP_SLUG }/installations/new`;

const POPUP_ID = 'github-app-install';

export const useLiveInstallations = ( {
	initialInstallationId,
}: UseLiveInstallationsParameters = {} ) => {
	const {
		data: installations = [],
		refetch,
		isLoading: isLoadingInstallations,
	} = useGithubInstallationsQuery();

	const [ installation, setInstallation ] = useState< GitHubInstallationData >();

	useLayoutEffect( () => {
		if ( installations.length === 0 || installation ) {
			return;
		}

		if ( initialInstallationId ) {
			const preselectedInstallation = installations.find(
				( installation ) => installation.external_id === initialInstallationId
			);

			if ( preselectedInstallation ) {
				setInstallation( preselectedInstallation );
				return;
			}
		}

		setInstallation( installations[ 0 ] );
	}, [ installations, installation, initialInstallationId ] );

	const onNewInstallationRequest = () => {
		openPopup< { installationId: number } >( {
			url: INSTALL_APP_URL,
			popupId: POPUP_ID,
			expectedEvent: 'github-app-installed',
		} )
			.then( async ( { installationId } ) => {
				const { data: newInstallations } = await refetch();

				const newInstallation = newInstallations?.find(
					( installation ) => installation.external_id === installationId
				);

				if ( newInstallation ) {
					setInstallation( newInstallation );
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
		installation,
		onNewInstallationRequest,
		setInstallation,
		installations,
		isLoadingInstallations,
	};
};
