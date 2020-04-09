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
			{ ! isMobile() && (
				<div className="mastering-gutenberg__illustration">
					<img src="/calypso/images/illustrations/gutenberg-mini.svg" alt="" />
				</div>
			) }
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
				/>
				<InlineSupportLink
					supportPostId={ 147594 }
					supportLink={ localizeUrl(
						'https://wordpress.com/support/wordpress-editor/#configuring-a-block'
					) }
					showIcon={ false }
					text={ translate( 'Adjusting settings of blocks' ) }
				/>
				<InlineSupportLink
					supportPostId={ 145498 }
					supportLink={ localizeUrl( 'https://support.wordpress.com/free-photo-library' ) }
					showIcon={ false }
					text={ translate(
						'Add free beautiful copyright-free photos to create stunning designs'
					) }
				/>
			</div>
		</Card>
	);
};

export default MasteringGutenberg;
