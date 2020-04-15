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
import EducationalCard from '../educational-card';

const MasteringGutenberg = () => {
	const translate = useTranslate();

	return (
		<EducationalCard
			header={ translate( 'Master the Block Editor' ) }
			text={ translate(
				'Learn how to create stunning post and page layouts through our video guides.'
			) }
			links={
				<>
					<InlineSupportLink
						supportPostId={ 147594 }
						supportLink={ localizeUrl( 'https://wordpress.com/support/wordpress-editor/#blocks' ) }
						showIcon={ false }
						text={ translate( 'Customizing posts and pages with blocks' ) }
					/>
					<InlineSupportLink
						supportPostId={ 147594 }
						supportLink={ localizeUrl(
							'https://wordpress.com/support/wordpress-editor/#configuring-a-block'
						) }
						showIcon={ false }
						text={ translate( 'Adjusting settings of blocks' ) }
					/>
				</>
			}
			illustration="/calypso/images/illustrations/gutenberg-mini.svg"
		/>
	);
};

export default MasteringGutenberg;
