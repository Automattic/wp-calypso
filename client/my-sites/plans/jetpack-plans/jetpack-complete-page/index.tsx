//TODO: Remove this eslnit exception when whole component/child components are finished.
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import rnaImageComplete from 'calypso/assets/images/jetpack/rna-image-complete.png';
import rnaImageComplete2xRetina from 'calypso/assets/images/jetpack/rna-image-complete@2x.png';
import QueryJetpackUserLicensesCounts from 'calypso/components/data/query-jetpack-user-licenses-counts';
import JetpackRnaDialogCard from 'calypso/components/jetpack/card/jetpack-rna-dialog-card';
import Main from 'calypso/components/main';
import { JPC_PATH_PLANS } from 'calypso/jetpack-connect/constants';
import { successNotice } from 'calypso/state/notices/actions';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import { QueryArgs, Duration } from '../types';
import ShowLicenseActivationLinkIfAvailable from './show-license-activation-link-if-available';

import './style.scss';

interface Props {
	defaultDuration: Duration;
	urlQueryArgs?: QueryArgs;
	siteSlug?: string;
	locale?: string;
}

const JetpackCompletePage: React.FC< Props > = ( {
	// these unused props I think will be needed later for the price componentt and the getCheckoutUrl() functions/buttons
	defaultDuration,
	urlQueryArgs,
	siteSlug,
	locale,
} ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId );

	useEffect( () => {
		if ( window.location.pathname.startsWith( JPC_PATH_PLANS ) ) {
			dispatch( successNotice( translate( 'Jetpack is successfully connected' ) ) );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return (
		<>
			<QueryJetpackUserLicensesCounts />
			<Main className="jetpack-complete-page__main" wideLayout>
				<ShowLicenseActivationLinkIfAvailable siteId={ siteId } />
				<JetpackRnaDialogCard
					cardImage={ rnaImageComplete }
					cardImage2xRetina={ rnaImageComplete2xRetina }
				>
					<>
						{ /* This is just example/fill text here, that should be made into various components */ }
						<h1
							style={ {
								fontSize: '36px',
								lineHeight: '40px',
								fontWeight: 700,
								marginBottom: '16px',
							} }
						>
							{ translate( 'Get Jetpack Complete' ) }
						</h1>
						<p style={ { fontSize: '20px', lineHeight: '30px', fontWeight: 500 } }>
							The full Jetpack suite with real-time security, instant site search, ad-free video,
							all CRM extensions, and extra storage for backups and video.
						</p>
					</>
				</JetpackRnaDialogCard>
			</Main>
		</>
	);
};

export default JetpackCompletePage;
