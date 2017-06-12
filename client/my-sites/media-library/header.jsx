/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import Gridicon from 'gridicons';

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

export default React.createClass( {
	displayName: 'MediaLibraryHeader',

	propTypes: {
		site: PropTypes.object,
		filter: PropTypes.string,
		source: PropTypes.string,
		sliderPositionCount: PropTypes.number,
		onMediaScaleChange: React.PropTypes.func,
		onAddMedia: PropTypes.func,
		sticky: React.PropTypes.bool,
	},

	getInitialState() {
		return {
			addingViaUrl: false,
			isMoreOptionsVisible: false
		};
	},

	getDefaultProps() {
		return {
			onAddMedia: () => {},
			sliderPositionCount: 100,
			sticky: false,
		};
	},

	setMoreOptionsContext( component ) {
		if ( ! component ) {
			return;
		}

		this.setState( {
			moreOptionsContext: component
		} );
	},

	toggleAddViaUrl( state ) {
		this.setState( {
			addingViaUrl: state,
			isMoreOptionsVisible: false
		} );
	},

	toggleMoreOptions( state ) {
		this.setState( {
			isMoreOptionsVisible: state
		} );
	},

	renderUploadButtons() {
		const { site, filter, onAddMedia } = this.props;

		if ( ! userCan( 'upload_files', site ) || this.props.source !== '' ) {
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
					<span className="is-desktop">{ this.translate( 'Add New', { context: 'Media upload' } ) }</span>
				</UploadButton>
				<Button
					compact
					ref={ this.setMoreOptionsContext }
					onClick={ this.toggleMoreOptions.bind( this, ! this.state.isMoreOptionsVisible ) }
					className="button media-library__upload-more">
					<span className="screen-reader-text">
						{ this.translate( 'More Options' ) }
					</span>
					<Gridicon icon="chevron-down" size={ 20 }/>
					<PopoverMenu
						context={ this.state.moreOptionsContext }
						isVisible={ this.state.isMoreOptionsVisible }
						onClose={ this.toggleMoreOptions.bind( this, false ) }
						position="bottom right"
						className="is-dialog-visible media-library__header-popover">
						<PopoverMenuItem onClick={ this.toggleAddViaUrl.bind( this, true ) }>
							{ this.translate( 'Add via URL', { context: 'Media upload' } ) }
						</PopoverMenuItem>
					</PopoverMenu>
				</Button>
			</ButtonGroup>
		);
	},

	renderSecondaryButtons() {
		if ( this.props.source !== '' ) {
			return;
		}

		return (
			<MediaModalSecondaryActions
				selectedItems={ this.props.selectedItems }
				onViewDetails={ this.props.onViewDetails }
				onDelete={ this.props.onDeleteItem }
				site={ this.props.site }
				view={ 'LIST' }
			/>
		);
	},

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
				{ this.renderSecondaryButtons() }

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
		} else {
			return card;
		}
	}
} );
