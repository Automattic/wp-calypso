import { __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import ReaderExportButton from 'calypso/blocks/reader-export-button';
import { READER_EXPORT_TYPE_SUBSCRIPTIONS } from 'calypso/blocks/reader-export-button/constants';
import ReaderImportButton from 'calypso/blocks/reader-import-button';
import { AddSitesButton } from 'calypso/landing/subscriptions/components/add-sites-button';
import { downloadCloud, uploadCloud } from 'calypso/reader/icons';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import ReaderSiteSubscriptions from './reader-site-subscriptions';
import SubscriptionsManagerWrapper from './subscriptions-manager-wrapper';

const SiteSubscriptionsManager = () => {
	const translate = useTranslate();
	const currentUser = useSelector( getCurrentUser );
	const isEmailVarified = currentUser?.email_verified;

	return (
		<>
			<div>
				<div>
					<SubscriptionsManagerWrapper
						actionButton={ isEmailVarified && <AddSitesButton /> }
						ellipsisMenuItems={
							<VStack spacing={ 1 }>
								{ isEmailVarified && <ReaderImportButton icon={ uploadCloud } iconSize={ 20 } /> }
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
				</div>
			</div>
		</>
	);
};

export default SiteSubscriptionsManager;
