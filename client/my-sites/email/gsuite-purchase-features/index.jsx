/** @format */

/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import GSuitePurchaseFeaturesSingleFeature from './single-feature';

/**
 * Style dependencies
 */
import './style.scss';

const GSuitePurchaseFeatures = ( { compact, domainName, productSlug, type } ) => {
	const translate = useTranslate();

	const getStorageText = () => {
		if ( 'gapps' === productSlug ) {
			return translate( 'Get 30GB of storage for all your files synced across devices.' );
		} else if ( 'gapps_unlimited' === productSlug ) {
			return translate( 'Get unlimited storage for all your files synced across devices.' );
		}
		return translate( 'Get 30GB or Unlimited storage for all your files synced across devices.' );
	};

	const getStorageTitle = () => {
		if ( ! compact ) {
			return translate( 'Keep all your files secure' );
		} else if ( 'gapps' === productSlug ) {
			return translate( '30GB Online File Storage' );
		} else if ( 'gapps_unlimited' === productSlug ) {
			return translate( 'Unlimited cloud storage (or 1TB per user if fewer than 5 users)' );
		}

		return translate( '30GB or Unlimited Online File Storage' );
	};

	return (
		<div
			className={
				'grid' === type
					? 'gsuite-purchase-features__features-grid'
					: 'gsuite-purchase-features__features-list'
			}
		>
			<GSuitePurchaseFeaturesSingleFeature
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
				imagePath={ '/calypso/images/g-suite/logo_gmail_48dp.svg' }
				imageAlt={ 'Gmail Logo' }
				compact={ compact }
			/>
			<GSuitePurchaseFeaturesSingleFeature
				title={ translate( 'Docs, spreadsheets and more' ) }
				description={
					compact
						? undefined
						: translate( 'Collaborate in real-time with documents, spreadsheets and slides.' )
				}
				imagePath={ '/calypso/images/g-suite/logo_docs_48dp.svg' }
				imageAlt={ 'Google Docs Logo' }
				compact={ compact }
			/>
			<GSuitePurchaseFeaturesSingleFeature
				title={ getStorageTitle() }
				description={ compact ? undefined : getStorageText() }
				imagePath={ '/calypso/images/g-suite/logo_drive_48dp.svg' }
				imageAlt={ 'Google Drive Logo' }
				compact={ compact }
			/>
			<GSuitePurchaseFeaturesSingleFeature
				title={
					compact ? translate( 'Video and voice calls' ) : translate( 'Connect with your team' )
				}
				description={
					compact
						? undefined
						: translate(
								'Use text chats, voice calls, or video calls, with built in screen sharing.'
						  )
				}
				imagePath={ '/calypso/images/g-suite/logo_hangouts_48dp.svg' }
				imageAlt={ 'Google Hangouts Logo' }
				compact={ compact }
			/>
		</div>
	);
};

GSuitePurchaseFeatures.propTypes = {
	compact: PropTypes.bool.isRequired,
	domainName: PropTypes.string.isRequired,
	productSlug: PropTypes.string,
	type: PropTypes.oneOf( [ 'grid', 'list' ] ),
};

GSuitePurchaseFeatures.defaultProps = {
	compact: false,
	type: 'grid',
};

export default GSuitePurchaseFeatures;
