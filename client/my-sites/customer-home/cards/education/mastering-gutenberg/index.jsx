/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';
import { Card } from '@automattic/components';
import { isMobile } from '@automattic/viewport';

/**
 * Internal dependencies
 */
import CardHeading from 'components/card-heading';
import InlineSupportLink from 'components/inline-support-link';
import { localizeUrl } from 'lib/i18n-utils';

/**
 * Style dependencies
 */
import './style.scss';

const MasteringGutenberg = () => {
	const translate = useTranslate();

	return (
		<Card className="mastering-gutenberg">
			<div>
				<CardHeading>{ translate( 'Master the Block Editor' ) }</CardHeading>
				<p className="mastering-gutenberg__text customer-home__card-subheader">
					{ translate(
						'Learn how to create stunning post and page layouts through our video guides.'
					) }
				</p>
				<InlineSupportLink
					supportPostId={ 147594 }
					supportLink={ localizeUrl( 'https://wordpress.com/support/wordpress-editor/#blocks' ) }
					showIcon={ false }
					text={ translate( 'Customizing posts and pages with blocks' ) }
					tracksEvent="calypso_customer_home_customizing_with_blocks_support_page_view"
					statsGroup="calypso_customer_home"
					statsName="view_customizing_with_blocks_video"
				/>
				<InlineSupportLink
					supportPostId={ 147594 }
					supportLink={ localizeUrl(
						'https://wordpress.com/support/wordpress-editor/#configuring-a-block'
					) }
					showIcon={ false }
					text={ translate( 'Adjusting settings of blocks' ) }
					tracksEvent={ 'calypso_customer_home_adjust_blocks_support_page_view' }
					statsGroup="calypso_customer_home"
					statsName="view_adjust_blocks_video"
				/>
			</div>
			{ ! isMobile() && (
				<div className="mastering-gutenberg__illustration">
					<img src="/calypso/images/illustrations/gutenberg-mini.svg" alt="" />
				</div>
			) }
		</Card>
	);
};

export default MasteringGutenberg;
