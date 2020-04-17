/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import InlineSupportLink from 'components/inline-support-link';
import { localizeUrl } from 'lib/i18n-utils';
import EducationalContent from '../educational-content';

const MasteringGutenberg = () => {
	const translate = useTranslate();

	return (
		<EducationalContent
			title={ translate( 'Master the Block Editor' ) }
			description={ translate(
				'Learn how to create stunning post and page layouts through our video guides.'
			) }
			links={
				<>
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
				</>
			}
			illustration="/calypso/images/illustrations/gutenberg-mini.svg"
		/>
	);
};

export default MasteringGutenberg;
