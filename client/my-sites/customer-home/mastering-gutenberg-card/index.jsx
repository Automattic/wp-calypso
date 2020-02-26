/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { localize } from 'i18n-calypso';
import { Button, Dialog } from '@automattic/components';

/**
 * Internal dependencies
 */
import DismissibleCard from 'blocks/dismissible-card';
import CardHeading from 'components/card-heading';
import Gridicon from 'components/gridicon';
import { localizeUrl } from 'lib/i18n-utils';

/**
 * Style dependencies
 */
import './style.scss';

class MasteringGutenbergCard extends Component {
	state = {
		showDialog: false,
	};

	handleDialogClosure = () => {
		this.setState( {
			showDialog: false,
			adjustingBlocks: false,
			navigatingBlocks: false,
			addingLinks: false,
			usingImages: false,
		} );
	};

	handleAdjustingBlocksClick = () => {
		this.setState( { showDialog: true, activeDialog: 'adjustingBlocks' } );
	};

	handleNavigatingBlocksClick = () => {
		this.setState( { showDialog: true, activeDialog: 'navigatingBlocks' } );
	};

	handleAddingLinkClick = () => {
		this.setState( { showDialog: true, activeDialog: 'addingLinks' } );
	};

	handleUsingImagesClick = () => {
		this.setState( { showDialog: true, activeDialog: 'usingImages' } );
	};

	render() {
		const { translate } = this.props;
		const { activeDialog, showDialog } = this.state;

		let dialogVideo;
		let dialogVideoPoster;
		let supportLink;

		switch ( activeDialog ) {
			case 'adjustingBlocks':
				dialogVideo =
					'https://wpcom.files.wordpress.com/2020/02/free-photo-library-demonstration.mp4';
				dialogVideoPoster =
					'https://ladygeekgirl.files.wordpress.com/2013/05/princess-mononoke-large-380266002.jpg';
				supportLink = localizeUrl(
					'https://en.support.wordpress.com/wordpress-editor/#adding-a-block'
				);
				break;
			case 'navigatingBlocks':
				dialogVideo =
					'https://wpcom.files.wordpress.com/2020/02/free-photo-library-demonstration.mp4';
				dialogVideoPoster =
					'https://ladygeekgirl.files.wordpress.com/2013/05/princess-mononoke-large-380266002.jpg';
				supportLink = localizeUrl(
					'https://en.support.wordpress.com/wordpress-editor/#adding-a-block'
				);
				break;
			case 'addingLinks':
				dialogVideo =
					'https://wpcom.files.wordpress.com/2020/02/free-photo-library-demonstration.mp4';
				dialogVideoPoster =
					'https://ladygeekgirl.files.wordpress.com/2013/05/princess-mononoke-large-380266002.jpg';
				supportLink = localizeUrl(
					'https://en.support.wordpress.com/links/#adding-links-to-posts-pages-and-widgets'
				);
				break;
			case 'usingImages':
				dialogVideo =
					'https://wpcom.files.wordpress.com/2020/02/free-photo-library-demonstration.mp4';
				dialogVideoPoster =
					'https://ladygeekgirl.files.wordpress.com/2013/05/princess-mononoke-large-380266002.jpg';
				supportLink = localizeUrl( 'https://en.support.wordpress.com/images/' );
				break;
		}

		return (
			<Fragment>
				<Dialog additionalClassNames="mastering-gutenberg-card__dialog" isVisible={ showDialog }>
					<video controls muted poster={ dialogVideoPoster }>
						<source src={ dialogVideo } type="video/mp4" />
					</video>
					<div className="mastering-gutenberg-card__dialog-buttons">
						<Button onClick={ this.handleDialogClosure }>{ translate( 'Close' ) }</Button>
						<Button href={ supportLink } primary target="_blank">
							{ translate( 'Learn more' ) }
							<Gridicon icon="external" />
						</Button>
					</div>
				</Dialog>
				<DismissibleCard
					preferenceName="customer-home-mastering-gutenberg-card"
					className="mastering-gutenberg-card"
				>
					<div className="mastering-gutenberg-card__illustration">
						<img src="/calypso/images/illustrations/gutenberg-mini.svg" alt="" />
					</div>
					<div>
						<CardHeading>{ translate( 'Master the block editor' ) }</CardHeading>
						<p className="mastering-gutenberg-card__text customer-home__card-subheader">
							{ translate(
								'Learn how to create stunning post and page layouts ' + 'through our video guides.'
							) }
						</p>
						<Button
							onClick={ this.handleAdjustingBlocksClick }
							className="mastering-gutenberg-card__link is-link"
						>
							{ translate( 'Adding, moving and deleting blocks' ) }
						</Button>
						<Button
							onClick={ this.handleNavigatingBlocksClick }
							className="mastering-gutenberg-card__link is-link"
						>
							{ translate( 'Quickly navigating between blocks' ) }
						</Button>
						<Button
							onClick={ this.handleAddingLinkClick }
							className="mastering-gutenberg-card__link is-link"
						>
							{ translate( 'Adding links' ) }
						</Button>
						<Button
							onClick={ this.handleUsingImagesClick }
							className="mastering-gutenberg-card__link is-link"
						>
							{ translate( 'Using images' ) }
						</Button>
					</div>
				</DismissibleCard>
			</Fragment>
		);
	}
}

export default localize( MasteringGutenbergCard );
