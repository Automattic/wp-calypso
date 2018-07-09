/** @format */

/**
 * External dependencies
 */

import React from 'react';
import Gridicon from 'gridicons';
import { debounce } from 'lodash';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import config from 'config';
import MediaLibraryScale from './scale';
import Card from 'components/card';
import Button from 'components/button';
import MediaActions from 'lib/media/actions';
import MediaListStore from 'lib/media/list-store';
import StickyPanel from 'components/sticky-panel';
import MediaFolderDropdown from './media-folder-dropdown';

const DEBOUNCE_TIME = 250;

class MediaLibraryExternalHeader extends React.Component {
	static propTypes = {
		onMediaScaleChange: PropTypes.func,
		site: PropTypes.object.isRequired,
		visible: PropTypes.bool.isRequired,
		canCopy: PropTypes.bool,
		selectedItems: PropTypes.array,
		onSourceChange: PropTypes.func,
		onFolderChange: PropTypes.func,
		sticky: PropTypes.bool,
		hasAttribution: PropTypes.bool,
		hasRefreshButton: PropTypes.bool,
		hasFolders: PropTypes.bool,
		folder: PropTypes.string,
		folders: PropTypes.array,
	};

	constructor( props ) {
		super( props );

		this.handleRefreshClick = this.onRefreshClick.bind( this );
		this.handleMedia = this.onUpdateState.bind( this );

		this.handleBackClick = this.handleBackClick.bind( this );

		// The MediaListStore fetching state can bounce between true and false quickly.
		// We disable the refresh button if fetching and rather than have the button flicker
		// we debounce when fetching=false, but don't debounce when fetching=true - this means
		// our refresh button is disabled instantly but only enabled after the debounce time
		this.handleFetchOn = this.onSetFetch.bind( this );
		this.handleFetchOff = debounce( this.onDisableFetch.bind( this ), DEBOUNCE_TIME );

		this.state = this.getState();
	}

	onSetFetch() {
		// We're now fetching - cancel any fetch=off debounce as we want the button to be disabled instantly
		this.handleFetchOff.cancel();
		this.setState( { fetching: true } );
	}

	onDisableFetch() {
		// This is debounced so we only enable the button DEBOUNCE_TIME after fetching is false
		this.setState( { fetching: false } );
	}

	componentDidMount() {
		MediaListStore.on( 'change', this.handleMedia );
	}

	componentWillUnmount() {
		// Cancel the debounce, just in case it fires after we've unmounted
		this.handleFetchOff.cancel();
		MediaListStore.off( 'change', this.handleMedia );
	}

	onUpdateState() {
		const { fetching } = this.getState();

		if ( fetching ) {
			this.handleFetchOn();
		} else {
			this.handleFetchOff();
		}
	}

	getState() {
		return {
			fetching: MediaListStore.isFetchingNextPage( this.props.site.ID ),
		};
	}

	handleBackClick( event ) {
		event.preventDefault();

		const rootIdentifier = '/';

		if ( this.props.folder !== rootIdentifier ) {
			this.props.onFolderChange( rootIdentifier );
		}
	}

	onRefreshClick() {
		const { ID } = this.props.site;

		MediaActions.sourceChanged( ID );
		MediaActions.fetchNextPage( ID );
	}

	onCopy = () => {
		const { site, selectedItems, source, onSourceChange } = this.props;

		onSourceChange( '', () => {
			MediaActions.addExternal( site, selectedItems, source );
		} );
	};

	renderCopyButton() {
		const { selectedItems, translate } = this.props;

		return (
			<Button
				className="media-library__header-item"
				compact
				disabled={ selectedItems.length === 0 }
				onClick={ this.onCopy }
				primary
			>
				{ translate( 'Copy to media library' ) }
			</Button>
		);
	}

	renderPexelsAttribution() {
		const { translate } = this.props;
		const attribution = translate( 'Photos provided by {{a}}Pexels{{/a}}', {
			components: {
				a: <a href="https://www.pexels.com/" rel="noopener noreferrer" target="_blank" />,
			},
		} );
		return <span className="media-library__pexels-attribution">{ attribution }</span>;
	}

	renderCard() {
		const {
			onMediaScaleChange,
			translate,
			canCopy,
			hasRefreshButton,
			hasAttribution,
			hasFolders,
			folder,
		} = this.props;

		const showBackButton = hasFolders && folder !== '/';
		const foldersWithPhotos = this.props.folders.filter( folderItem => folderItem.children );

		return (
			<Card className="media-library__header">
				{ hasAttribution && this.renderPexelsAttribution() }

				{ showBackButton && (
					<Button
						className="media-library__header-item media-library__header-btn is-primary"
						compact
						disabled={ this.state.fetching }
						onClick={ this.handleBackClick }
					>
						<Gridicon icon="arrow-left" size={ 24 } />

						<span>{ translate( 'Back to Folders' ) }</span>
					</Button>
				) }

				{ hasRefreshButton && (
					<Button
						className="media-library__header-item media-library__header-btn"
						compact
						disabled={ this.state.fetching }
						onClick={ this.handleRefreshClick }
					>
						<Gridicon icon="refresh" size={ 24 } />

						<span>{ translate( 'Refresh' ) }</span>
					</Button>
				) }

				{ canCopy && this.renderCopyButton() }

				{ config.isEnabled( 'external-media/google-photos/folder-dropdown' ) && (
					<MediaFolderDropdown
						className="media-library__header-item"
						disabled={ this.state.fetching }
						onFolderChange={ this.props.onFolderChange }
						folders={ foldersWithPhotos }
						folder={ this.props.folder }
						defaultOption={ {
							value: '/',
							label: 'All Albums',
						} }
					/>
				) }

				<MediaLibraryScale onChange={ onMediaScaleChange } />
			</Card>
		);
	}

	render() {
		const { visible } = this.props;

		if ( ! visible ) {
			return null;
		}

		if ( this.props.sticky ) {
			return <StickyPanel minLimit={ 660 }>{ this.renderCard() }</StickyPanel>;
		}

		return this.renderCard();
	}
}

export default localize( MediaLibraryExternalHeader );
