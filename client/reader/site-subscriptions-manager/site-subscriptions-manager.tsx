import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import ReaderExportButton from 'calypso/blocks/reader-export-button';
import { READER_EXPORT_TYPE_SUBSCRIPTIONS } from 'calypso/blocks/reader-export-button/constants';
import ReaderImportButton from 'calypso/blocks/reader-import-button';
import { AddSitesButton } from 'calypso/landing/subscriptions/components/add-sites-button';
import { useDispatch } from 'calypso/state';
import { successNotice } from 'calypso/state/notices/actions';
import ReaderSiteSubscriptions from './reader-site-subscriptions';
import SubscriptionsManagerWrapper from './subscriptions-manager-wrapper';

const SiteSubscriptionsManager = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	useEffect( () => {
		const url = new URL( window.location.href );

		if ( url.searchParams.get( 'status' ) === 'unsubscribed' ) {
			dispatch(
				successNotice( translate( 'You have successfully unsubscribed.' ), { duration: 8000 } )
			);
			url.searchParams.delete( 'status' );
			window.history.replaceState( null, '', url.toString() );
		}
	}, [ dispatch, translate ] );

	return (
		<>
			<div>
				<div>
					<SubscriptionsManagerWrapper
						actionButton={ <AddSitesButton /> }
						ellipsisMenuItems={
							<>
								<ReaderImportButton />
								<ReaderExportButton exportType={ READER_EXPORT_TYPE_SUBSCRIPTIONS } />
							</>
						}
						headerText={ translate( 'Manage subscribed sites' ) }
						subHeaderText={ translate( 'Manage your site, RSS, and newsletter subscriptions.' ) }
					>
						<ReaderSiteSubscriptions />
					</SubscriptionsManagerWrapper>
				</div>
			</div>
		</>
	);
};

export default SiteSubscriptionsManager;
