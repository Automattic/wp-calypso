/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import Gridicon from 'components/gridicon';

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
import { Card, Button, ScreenReaderText } from '@automattic/components';
import ButtonGroup from 'components/button-group';
import StickyPanel from 'components/sticky-panel';

class MediaLibraryHeader extends React.Component {
	static displayName = 'MediaLibraryHeader';

	static propTypes = {
		site: PropTypes.object,
		filter: PropTypes.string,
		sliderPositionCount: PropTypes.number,
		onMediaScaleChange: PropTypes.func,
		onAddMedia: PropTypes.func,
		sticky: PropTypes.bool,
	};

	static defaultProps = {
		onAddMedia: () => {},
		sliderPositionCount: 100,
		sticky: false,
	};

	state = {
		addingViaUrl: false,
		isMoreOptionsVisible: false,
	};

	setMoreOptionsContext = ( component ) => {
		if ( ! component ) {
			return;
		}

		this.setState( {
			moreOptionsContext: component,
		} );
	};

	toggleAddViaUrl = ( state ) => {
		this.setState( {
			addingViaUrl: state,
			isMoreOptionsVisible: false,
		} );
	};

	toggleMoreOptions = ( state ) => {
		this.setState( {
			isMoreOptionsVisible: state,
		} );
	};

	renderUploadButtons = () => {
		const { site, filter, onAddMedia } = this.props;

		if ( ! userCan( 'upload_files', site ) ) {
			return;
		}

		return (
			<ButtonGroup className="media-library__upload-buttons">
				<UploadButton
					site={ site }
					filter={ filter }
					onAddMedia={ onAddMedia }
					className="media-library__upload-button button is-compact"
				>
					<Gridicon icon="add-image" />
					<span className="media-library__upload-button-label">
						{ this.props.translate( 'Add new', { context: 'Media upload' } ) }
					</span>
				</UploadButton>
				<Button
					compact
					ref={ this.setMoreOptionsContext }
					onClick={ this.toggleMoreOptions.bind( this, ! this.state.isMoreOptionsVisible ) }
					className="button media-library__upload-more"
					data-tip-target="media-library-upload-more"
				>
					<ScreenReaderText>{ this.props.translate( 'More Options' ) }</ScreenReaderText>
					<Gridicon icon="chevron-down" size={ 18 } />
					<PopoverMenu
						context={ this.state.moreOptionsContext }
						isVisible={ this.state.isMoreOptionsVisible }
						onClose={ this.toggleMoreOptions.bind( this, false ) }
						position="bottom right"
						className="is-dialog-visible media-library__header-popover"
					>
						<PopoverMenuItem onClick={ this.toggleAddViaUrl.bind( this, true ) }>
							{ this.props.translate( 'Add via URL', { context: 'Media upload' } ) }
						</PopoverMenuItem>
					</PopoverMenu>
				</Button>
			</ButtonGroup>
		);
	};

	render() {
		const { site, onAddMedia } = this.props;

		if ( this.state.addingViaUrl ) {
			return (
				<MediaLibraryUploadUrl
					site={ site }
					onAddMedia={ onAddMedia }
					onClose={ this.toggleAddViaUrl.bind( this, false ) }
					className="media-library__header"
				/>
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
				<MediaLibraryScale onChange={ this.props.onMediaScaleChange } />
			</Card>
		);

		if ( this.props.sticky ) {
			return <StickyPanel minLimit={ 660 }>{ card }</StickyPanel>;
		}
		return card;
	}
}

export default localize( MediaLibraryHeader );
