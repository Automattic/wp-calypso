import { __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import ReaderExportButton from 'calypso/blocks/reader-export-button';
import { READER_EXPORT_TYPE_SUBSCRIPTIONS } from 'calypso/blocks/reader-export-button/constants';
import ReaderImportButton from 'calypso/blocks/reader-import-button';
import { AddSitesButton } from 'calypso/landing/subscriptions/components/add-sites-button';
import { downloadCloud, uploadCloud } from 'calypso/reader/icons';
import ReaderSiteSubscriptions from './reader-site-subscriptions';
import SubscriptionsManagerWrapper from './subscriptions-manager-wrapper';

const SiteSubscriptionsManager = () => {
	const translate = useTranslate();

	return (
		<SubscriptionsManagerWrapper
			actionButton={ <AddSitesButton /> }
			ellipsisMenuItems={
				<VStack spacing={ 1 }>
					<ReaderImportButton icon={ uploadCloud } iconSize={ 20 } />
					<ReaderExportButton
						icon={ downloadCloud }
						iconSize={ 20 }
						exportType={ READER_EXPORT_TYPE_SUBSCRIPTIONS }
					/>
				</VStack>
			}
			headerText={ translate( 'Manage subscribed sites' ) }
			subHeaderText={ translate( 'Manage your site, RSS, and newsletter subscriptions.' ) }
		>
			<ReaderSiteSubscriptions />
		</SubscriptionsManagerWrapper>
	);
};

export default SiteSubscriptionsManager;
