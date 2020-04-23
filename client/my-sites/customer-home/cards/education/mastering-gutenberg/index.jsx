/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { localizeUrl } from 'lib/i18n-utils';
import EducationalContent from '../educational-content';

const MasteringGutenberg = () => {
	const translate = useTranslate();

	return (
		<EducationalContent
			title={ translate( 'Master the Block Editor' ) }
			description={ translate(
				'Learn how to create stunning post and page layouts with our short video guides.'
			) }
			links={ [
				{
					postId: 147594,
					url: localizeUrl( 'https://wordpress.com/support/wordpress-editor/#blocks' ),
					text: translate( 'Adding and moving blocks' ),
					icon: 'video',
					tracksEvent: 'calypso_customer_home_customizing_with_blocks_support_page_view',
					statsName: 'view_customizing_with_blocks_video',
				},
				{
					postId: 147594,
					url: localizeUrl( 'https://wordpress.com/support/wordpress-editor/#configuring-a-block' ),
					text: translate( 'Adjust settings of blocks' ),
					icon: 'video',
					tracksEvent: 'calypso_customer_home_adjust_blocks_support_page_view',
					statsName: 'view_adjust_blocks_video',
				},
			] }
			illustration="/calypso/images/illustrations/gutenberg-mini.svg"
		/>
	);
};

export default MasteringGutenberg;
