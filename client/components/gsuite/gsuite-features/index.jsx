import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import googleDocsIcon from 'calypso/assets/images/email-providers/google-workspace/services/docs.svg';
import googleDriveIcon from 'calypso/assets/images/email-providers/google-workspace/services/drive.svg';
import gmailIcon from 'calypso/assets/images/email-providers/google-workspace/services/gmail.svg';
import googleMeetIcon from 'calypso/assets/images/email-providers/google-workspace/services/meet.svg';
import {
	GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
	GSUITE_BASIC_SLUG,
	GSUITE_BUSINESS_SLUG,
} from 'calypso/lib/gsuite/constants';
import GSuiteSingleFeature from './single-feature';

import './style.scss';

const GSuiteFeatures = ( { compact, domainName, productSlug, type } ) => {
	const translate = useTranslate();

	const getStorageText = () => {
		if ( compact ) {
			return undefined;
		} else if (
			[ GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY, GSUITE_BASIC_SLUG ].includes( productSlug )
		) {
			return translate( 'Get 30GB of storage for all your files synced across devices.' );
		} else if ( GSUITE_BUSINESS_SLUG === productSlug ) {
			return translate( 'Get unlimited storage for all your files synced across devices.' );
		}

		return translate( 'Get 30GB or unlimited storage for all your files synced across devices.' );
	};

	const getStorageTitle = () => {
		if ( ! compact ) {
			return translate( 'Keep all your files secure' );
		} else if (
			[ GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY, GSUITE_BASIC_SLUG ].includes( productSlug )
		) {
			return translate( '30GB of cloud storage' );
		} else if ( GSUITE_BUSINESS_SLUG === productSlug ) {
			return translate( 'Unlimited cloud storage (or 1TB per user if fewer than 5 users)' );
		}

		return translate( '30GB or unlimited cloud storage' );
	};

	return (
		<div className={ 'grid' === type ? 'gsuite-features__grid' : 'gsuite-features__list' }>
			<GSuiteSingleFeature
				title={ translate( 'A custom @%(domain)s email address', {
					args: {
						domain: domainName,
					},
				} ) }
				description={
					compact
						? undefined
						: translate( 'Professional ad-free email that works with most email clients.' )
				}
				imagePath={ gmailIcon }
				imageAlt={ 'Gmail Logo' }
				compact={ compact }
			/>
			<GSuiteSingleFeature
				title={ translate( 'Docs, spreadsheets and more' ) }
				description={
					compact
						? undefined
						: translate( 'Collaborate in real-time with documents, spreadsheets and slides.' )
				}
				imagePath={ googleDocsIcon }
				imageAlt={ 'Google Docs Logo' }
				compact={ compact }
			/>
			<GSuiteSingleFeature
				title={ getStorageTitle() }
				description={ getStorageText() }
				imagePath={ googleDriveIcon }
				imageAlt={ 'Google Drive Logo' }
				compact={ compact }
			/>
			<GSuiteSingleFeature
				title={ compact ? translate( 'Video calls' ) : translate( 'Connect with your team' ) }
				description={
					compact
						? undefined
						: translate( 'Use text chats or video calls, with built in screen sharing.' )
				}
				imagePath={ googleMeetIcon }
				imageAlt={ 'Google Meet Logo' }
				compact={ compact }
			/>
		</div>
	);
};

GSuiteFeatures.propTypes = {
	compact: PropTypes.bool.isRequired,
	domainName: PropTypes.string.isRequired,
	productSlug: PropTypes.string,
	type: PropTypes.oneOf( [ 'grid', 'list' ] ).isRequired,
};

GSuiteFeatures.defaultProps = {
	compact: false,
	type: 'grid',
};

export default GSuiteFeatures;
