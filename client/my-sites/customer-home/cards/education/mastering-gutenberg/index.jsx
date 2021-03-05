/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { localizeUrl } from 'calypso/lib/i18n-utils';
import EducationalContent from '../educational-content';
import { EDUCATION_GUTENBERG } from 'calypso/my-sites/customer-home/cards/constants';

/**
 * Image dependencies
 */
import gutenbergIllustration from 'calypso/assets/images/customer-home/illustration--secondary-gutenberg.svg';

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
					materialIcon: 'play_circle_outline',
				},
				{
					postId: 147594,
					url: localizeUrl( 'https://wordpress.com/support/wordpress-editor/#configuring-a-block' ),
					text: translate( 'Adjust settings of blocks' ),
					materialIcon: 'play_circle_outline',
				},
			] }
			illustration={ gutenbergIllustration }
			cardName={ EDUCATION_GUTENBERG }
		/>
	);
};

export default MasteringGutenberg;
