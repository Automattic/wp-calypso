/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { localize } from 'i18n-calypso';
import { Card, Button, Dialog } from '@automattic/components';
import { isDesktop } from '@automattic/viewport';

/**
 * Internal dependencies
 */
import CardHeading from 'components/card-heading';
import { localizeUrl } from 'lib/i18n-utils';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Image dependencies
 */
import freePhotoLibraryThumbnail from 'assets/images/customer-home/free-photo-library-thumbnail.png';
import freePhotoLibraryVideoPrompt from 'assets/images/customer-home/free-photo-library-video-prompt.png';

class FreePhotoLibraryCard extends Component {
	state = {
		showDialog: false,
	};

	toggleDialog = () => {
		this.setState( state => ( {
			showDialog: ! state.showDialog,
		} ) );
	};

	render() {
		const { translate } = this.props;
		return (
			<Fragment>
				<Dialog
					additionalClassNames="free-photo-library-card__dialog"
					isVisible={ this.state.showDialog }
				>
					<video
						className="free-photo-library-card__demonstration-video"
						controls
						muted
						poster={ freePhotoLibraryThumbnail }
					>
						<source
							src="https://wpcom.files.wordpress.com/2020/02/free-photo-library-demonstration.mp4"
							type="video/mp4"
						/>
					</video>
					<div className="free-photo-library-card__dialog-close">
						<Button onClick={ this.toggleDialog }>{ translate( 'Close' ) }</Button>
					</div>
				</Dialog>
				<Card className="free-photo-library-card">
					{ /* eslint-disable */ }
					{ isDesktop() && (
						<img
							className="free-photo-library-card__demonstration-image"
							src={ freePhotoLibraryVideoPrompt }
							alt={ translate( 'Free Photo Library demonstration' ) }
							onClick={ this.toggleDialog }
							onKeyDown={ this.toggleDialog }
							tabIndex="0"
						/>
					) }
					{ /* eslint-enable */ }
					<CardHeading>{ translate( 'Over 40,000 Free Photos' ) }</CardHeading>
					<p className="free-photo-library-card__text customer-home__card-subheader">
						{ translate(
							'The WordPress.com Free Photo Library integrates ' +
								'your site with beautiful copyright-free photos to ' +
								'create stunning designs.'
						) }
					</p>
					<Button href={ localizeUrl( 'https://support.wordpress.com/free-photo-library/' ) }>
						{ translate( 'Learn more' ) }
					</Button>
				</Card>
			</Fragment>
		);
	}
}

export default localize( FreePhotoLibraryCard );
