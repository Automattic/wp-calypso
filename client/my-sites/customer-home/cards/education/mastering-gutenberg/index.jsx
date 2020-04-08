/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { Button, Card, Dialog } from '@automattic/components';
import { isMobile } from '@automattic/viewport';

/**
 * Internal dependencies
 */
import CardHeading from 'components/card-heading';
import Gridicon from 'components/gridicon';
import { localizeUrl } from 'lib/i18n-utils';
import isClassicEditorForced from 'state/selectors/is-classic-editor-forced';
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * Style dependencies
 */
import './style.scss';

class MasteringGutenberg extends Component {
	state = {
		activeDialog: false,
	};

	handleDialogClosure = () => {
		this.setState( {
			showDialog: false,
			activeDialog: false,
		} );
	};

	handleButtonClick = button => {
		this.setState( { showDialog: true, activeDialog: button } );
	};

	render() {
		const { cannotUseGutenberg, translate } = this.props;
		const { activeDialog, showDialog } = this.state;

		if ( cannotUseGutenberg ) {
			return null;
		}

		let supportLink;
		let videoId;

		switch ( activeDialog ) {
			case 'adjustingBlocks':
				videoId = 'oQNap9YTrWw';
				supportLink = localizeUrl( 'https://wordpress.com/support/wordpress-editor' );
				break;
			case 'customizingWithBlocks':
				videoId = 'BkQlTuJ4BH8';
				supportLink = localizeUrl( 'https://wordpress.com/support/wordpress-editor/blocks/' );
				break;
		}

		return (
			<Fragment>
				<Dialog additionalClassNames="mastering-gutenberg__dialog" isVisible={ showDialog }>
					<iframe
						title={ translate( 'Video demonstration' ) }
						width="853"
						height="480"
						src={ `https://www.youtube.com/embed/${ videoId }?rel=0&autoplay=1` }
						frameBorder="0"
						allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
						allowFullScreen={ true }
					/>
					<div className="mastering-gutenberg__dialog-buttons">
						<Button onClick={ this.handleDialogClosure }>{ translate( 'Close' ) }</Button>
						<Button href={ supportLink } primary target="_blank">
							{ translate( 'Learn more' ) }
							<Gridicon icon="external" />
						</Button>
					</div>
				</Dialog>
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
						<Button
							onClick={ this.handleButtonClick.bind( this, 'adjustingBlocks' ) }
							className="mastering-gutenberg__link is-link"
						>
							{ translate( 'Adjusting settings of blocks' ) }
						</Button>
						<Button
							onClick={ this.handleButtonClick.bind( this, 'customizingWithBlocks' ) }
							className="mastering-gutenberg__link is-link"
						>
							{ translate( 'Customizing posts and pages with blocks' ) }
						</Button>
					</div>
				</Card>
			</Fragment>
		);
	}
}

export default connect( state => {
	return {
		cannotUseGutenberg: isClassicEditorForced( state, getSelectedSiteId( state ) ),
	};
} )( localize( MasteringGutenberg ) );
