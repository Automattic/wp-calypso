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

export default React.createClass( {
	displayName: 'MediaLibraryHeader',

	propTypes: {
		site: PropTypes.object,
		filter: PropTypes.string,
		sliderPositionCount: PropTypes.number,
		onMediaScaleChange: React.PropTypes.func,
		onAddMedia: PropTypes.func
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
			sliderPositionCount: 100
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

		if ( ! userCan( 'upload_files', site ) ) {
			return;
		}

		return (
			<div className="media-library__upload-buttons">
				<UploadButton
					site={ site }
					filter={ filter }
					onAddMedia={ onAddMedia }
					className="button is-primary">
					{ this.translate( 'Add New', { context: 'Media upload' } ) }
				</UploadButton>
				<button
					onClick={ this.toggleAddViaUrl.bind( this, true ) }
					className="button is-desktop">
					{ this.translate( 'Add via URL', { context: 'Media upload' } ) }
				</button>
				<button
					ref={ this.setMoreOptionsContext }
					onClick={ this.toggleMoreOptions.bind( this, ! this.state.isMoreOptionsVisible ) }
					className="button is-primary is-mobile">
					<span className="screen-reader-text">
						{ this.translate( 'More Options' ) }
					</span>
					<Gridicon icon="chevron-down" size={ 20 }/>
					<PopoverMenu
						context={ this.state.moreOptionsContext }
						isVisible={ this.state.isMoreOptionsVisible }
						onClose={ this.toggleMoreOptions.bind( this, false ) }
						position="bottom right"
						className="popover is-dialog-visible">
						<PopoverMenuItem onClick={ this.toggleAddViaUrl.bind( this, true ) }>
							{ this.translate( 'Add via URL', { context: 'Media upload' } ) }
						</PopoverMenuItem>
					</PopoverMenu>
				</button>
			</div>
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

		return (
			<header className="media-library__header">
				<h2 className="media-library__heading">{ this.translate( 'Media Library' ) }</h2>
				{ this.renderUploadButtons() }
				<MediaLibraryScale
					onChange={ this.props.onMediaScaleChange } />
			</header>
		);
	}
} );
