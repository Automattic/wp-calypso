/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PopoverMenu from 'components/popover/menu';
import PopoverMenuItem from 'components/popover/menu-item';
import MediaLibraryScale from './scale';
import UploadButton from './upload-button';
import MediaLibraryUploadUrl from './upload-url';
import { userCan } from 'lib/site/utils';
import MediaModalSecondaryActions from 'post-editor/media-modal/secondary-actions';
import Card from 'components/card';
import ButtonGroup from 'components/button-group';
import Button from 'components/button';
import StickyPanel from 'components/sticky-panel';

class MediaLibraryHeader extends Component {
	constructor( props ) {
		super( props );

		this.handleGoogle = this.onClickGoogle.bind( this );
		this.handleAddUrlOpenOpen = this.toggleAddViaUrl.bind( this, true );
		this.handleMoreOptions = this.setMoreOptionsContext.bind( this );
		this.state = {
			addingViaUrl: false,
			isMoreOptionsVisible: false
		};
	}

	setMoreOptionsContext( component ) {
		if ( ! component ) {
			return;
		}

		this.setState( {
			moreOptionsContext: component
		} );
	}

	toggleAddViaUrl( state ) {
		this.setState( {
			addingViaUrl: state,
			isMoreOptionsVisible: false
		} );
	}

	toggleMoreOptions( state ) {
		this.setState( {
			isMoreOptionsVisible: state
		} );
	}

	onClickGoogle() {
		this.props.onSourceChange( 'google_photos' );
	}

	getPopoverButtons() {
		const { translate } = this.props;

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		const buttons = [
			<PopoverMenuItem onClick={ this.handleAddUrlOpen } key={ 0 }>
				{ translate( 'Add via URL', { context: 'Media upload' } ) }
			</PopoverMenuItem>
		];

		if ( this.props.onSourceChange ) {
			buttons.push(
				<PopoverMenuItem onClick={ this.handleGoogle } key={ 1 }>
					{ translate( 'Add from Google', { context: 'Media upload' } ) }
				</PopoverMenuItem>
			);
		}

		return buttons;
	}

	renderUploadButtons() {
		const { site, filter, onAddMedia } = this.props;
		const { translate } = this.props;

		if ( ! userCan( 'upload_files', site ) ) {
			return;
		}

		return (
			<ButtonGroup className="media-library__upload-buttons">
				<UploadButton
					site={ site }
					filter={ filter }
					onAddMedia={ onAddMedia }
					className="button is-compact">
					<Gridicon icon="add-image" />
					<span className="is-desktop">{ translate( 'Add New', { context: 'Media upload' } ) }</span>
				</UploadButton>
				<Button
					compact
					ref={ this.handleMoreOptions }
					onClick={ this.toggleMoreOptions.bind( this, ! this.state.isMoreOptionsVisible ) }
					className="button media-library__upload-more">
					<span className="screen-reader-text">
						{ translate( 'More Options' ) }
					</span>
					<Gridicon icon="chevron-down" size={ 20 }/>
					<PopoverMenu
						context={ this.state.moreOptionsContext }
						isVisible={ this.state.isMoreOptionsVisible }
						onClose={ this.toggleMoreOptions.bind( this, false ) }
						position="bottom right"
						className="is-dialog-visible media-library__header-popover">
						{ this.getPopoverButtons() }
					</PopoverMenu>
				</Button>
			</ButtonGroup>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}

	render() {
		const { site, onAddMedia } = this.props;

		if ( this.state.addingViaUrl ) {
			return (
				<MediaLibraryUploadUrl
					site={ site }
					onAddMedia={ onAddMedia }
					onClose={ this.toggleAddViaUrl.bind( this, false ) }
					className="media-library__header" />
			);
		}

		const card = (
			<Card className="media-library__header">
				{ this.renderUploadButtons() }
				<MediaModalSecondaryActions
					selectedItems={ this.props.selectedItems }
					onViewDetails={ this.props.onViewDetails }
					onDelete={ this.props.onDeleteItem }
					site={ this.props.site }
					view={ 'LIST' }
				/>
				<MediaLibraryScale
					onChange={ this.props.onMediaScaleChange } />
			</Card>
		);

		if ( this.props.sticky ) {
			return (
				<StickyPanel minLimit ={ 660 }>
					{ card }
				</StickyPanel>
			);
		}

		return card;
	}
}

MediaLibraryHeader.propTypes = {
	site: PropTypes.object,
	filter: PropTypes.string,
	sliderPositionCount: PropTypes.number,
	onMediaScaleChange: React.PropTypes.func,
	onSourceChange: React.PropTypes.func,
	onAddMedia: PropTypes.func,
	sticky: React.PropTypes.bool,
};

MediaLibraryHeader.defaultProps = {
	onAddMedia: () => {},
	sliderPositionCount: 100,
	sticky: false,
};

export default localize( MediaLibraryHeader );
