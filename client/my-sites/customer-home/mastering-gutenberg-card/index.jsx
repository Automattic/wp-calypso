/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { localize } from 'i18n-calypso';
import { Card, Button, Dialog } from '@automattic/components';

/**
 * Internal dependencies
 */
import ButtonGroup from 'components/button-group';
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
		this.setState( { showDialog: true, adjustingBlocks: true } );
	};

	handleNavigatingBlocksClick = () => {
		this.setState( { showDialog: true, navigatingBlocks: true } );
	};

	handleAddingLinkClick = () => {
		this.setState( { showDialog: true, addingLinks: true } );
	};

	handleUsingImagesClick = () => {
		this.setState( { showDialog: true, usingImages: true } );
	};

	render() {
		const { translate } = this.props;
		const { showDialog, adjustingBlocks, navigatingBlocks, addingLinks, usingImages } = this.state;

		let dialogVideo;
		let dialogVideoPoster;
		let supportLink;

		if ( adjustingBlocks ) {
			dialogVideo =
				'https://wpcom.files.wordpress.com/2020/02/free-photo-library-demonstration.mp4';
			dialogVideoPoster =
				'https://ladygeekgirl.files.wordpress.com/2013/05/princess-mononoke-large-380266002.jpg';
			supportLink = localizeUrl(
				'https://en.support.wordpress.com/wordpress-editor/#adding-a-block'
			);
		} else if ( navigatingBlocks ) {
			dialogVideo =
				'https://wpcom.files.wordpress.com/2020/02/free-photo-library-demonstration.mp4';
			dialogVideoPoster =
				'https://ladygeekgirl.files.wordpress.com/2013/05/princess-mononoke-large-380266002.jpg';
			supportLink = localizeUrl(
				'https://en.support.wordpress.com/wordpress-editor/#adding-a-block'
			);
		} else if ( addingLinks ) {
			dialogVideo =
				'https://wpcom.files.wordpress.com/2020/02/free-photo-library-demonstration.mp4';
			dialogVideoPoster =
				'https://ladygeekgirl.files.wordpress.com/2013/05/princess-mononoke-large-380266002.jpg';
			supportLink = localizeUrl(
				'https://en.support.wordpress.com/links/#adding-links-to-posts-pages-and-widgets'
			);
		} else if ( usingImages ) {
			dialogVideo =
				'https://wpcom.files.wordpress.com/2020/02/free-photo-library-demonstration.mp4';
			dialogVideoPoster =
				'https://ladygeekgirl.files.wordpress.com/2013/05/princess-mononoke-large-380266002.jpg';
			supportLink = localizeUrl( 'https://en.support.wordpress.com/images/' );
		}

		return (
			<Fragment>
				<Dialog additionalClassNames="mastering-gutenberg-card__dialog" isVisible={ showDialog }>
					<video controls muted poster={ dialogVideoPoster }>
						<source src={ dialogVideo } type="video/mp4" />
					</video>
					<div className="mastering-gutenberg-card__dialog-buttons">
						<ButtonGroup>
							<Button onClick={ this.handleDialogClosure }>{ translate( 'Close' ) }</Button>
							<Button href={ supportLink } primary target="_blank">
								{ translate( 'Learn more' ) }
								<Gridicon icon="external" />
							</Button>
						</ButtonGroup>
					</div>
				</Dialog>
				<Card className="mastering-gutenberg-card">
					<div className="mastering-gutenberg-card__illustration">
						<img src="/calypso/images/illustrations/gutenberg-mini.svg" alt="" />
					</div>
					<CardHeading>{ translate( 'Master the Block Editor' ) }</CardHeading>
					<p className="mastering-gutenberg-card__text customer-home__card-subheader">
						{ translate(
							'Learn how to create stunning post and page layouts ' + 'through our video guides.'
						) }
					</p>
					<div className="mastering-gutenberg-card__links">
						<Gridicon icon="add-outline" size={ 18 } />
						<Button
							onClick={ this.handleAdjustingBlocksClick }
							className="mastering-gutenberg-card__item is-link"
						>
							{ translate( 'Adding, moving and deleting blocks' ) }
						</Button>
					</div>
					<div className="mastering-gutenberg-card__links">
						<Gridicon icon="layout-blocks" size={ 18 } />
						<Button
							onClick={ this.handleNavigatingBlocksClick }
							className="mastering-gutenberg-card__item is-link"
						>
							{ translate( 'Quickly navigating between blocks' ) }
						</Button>
					</div>
					<div className="mastering-gutenberg-card__links">
						<Gridicon icon="link" size={ 18 } />
						<Button
							onClick={ this.handleAddingLinkClick }
							className="mastering-gutenberg-card__item is-link"
						>
							{ translate( 'Adding links' ) }
						</Button>
					</div>
					<div className="mastering-gutenberg-card__links">
						<Gridicon icon="image-multiple" size={ 18 } />
						<Button
							onClick={ this.handleUsingImagesClick }
							className="mastering-gutenberg-card__item is-link"
						>
							{ translate( 'Using images' ) }
						</Button>
					</div>
				</Card>
			</Fragment>
		);
	}
}

export default localize( MasteringGutenbergCard );
