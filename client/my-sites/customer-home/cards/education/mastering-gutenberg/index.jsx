/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { Card } from '@automattic/components';
import { isMobile } from '@automattic/viewport';

/**
 * Internal dependencies
 */
import CardHeading from 'components/card-heading';
import InlineSupportLink from 'components/inline-support-link';
import { localizeUrl } from 'lib/i18n-utils';
import isClassicEditorForced from 'state/selectors/is-classic-editor-forced';
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * Style dependencies
 */
import './style.scss';
const MasteringGutenberg = ( { cannotUseGutenberg, translate } ) => {
	if ( cannotUseGutenberg ) {
		return null;
	}

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
						'Learn how to create stunning post and page layouts ' + 'through our video guides.'
					) }
				</p>
				<InlineSupportLink
					supportPostId={ 147594 }
					supportLink={ localizeUrl( 'https://wordpress.com/support/wordpress-editor/#blocks' ) }
					showIcon={ false }
					text={ translate( 'Adjusting settings of blocks' ) }
				/>
				<InlineSupportLink
					supportPostId={ 147594 }
					supportLink={ localizeUrl(
						'https://wordpress.com/support/wordpress-editor/#configuring-a-block'
					) }
					showIcon={ false }
					text={ translate( 'Customizing posts and pages with blocks' ) }
				/>
			</div>
		</Card>
	);
};

export default connect( state => {
	return {
		cannotUseGutenberg: isClassicEditorForced( state, getSelectedSiteId( state ) ),
	};
} )( localize( MasteringGutenberg ) );
