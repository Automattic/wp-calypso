import { Card, Button, Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import StickyPanel from 'calypso/components/sticky-panel';
import { withAddExternalMedia } from 'calypso/data/media/with-add-external-media';
import { changeMediaSource } from 'calypso/state/media/actions';
import { fetchNextMediaPage } from 'calypso/state/media/thunks';
import isFetchingNextPage from 'calypso/state/selectors/is-fetching-next-page';
import MediaLibraryScale from './scale';

const DEBOUNCE_TIME = 250;

class MediaLibraryExternalHeader extends Component {
	static propTypes = {
		addExternalMedia: PropTypes.func,
		canCopy: PropTypes.bool,
		hasAttribution: PropTypes.bool,
		hasRefreshButton: PropTypes.bool,
		isFetchingNextPage: PropTypes.bool,
		mediaScale: PropTypes.number,
		onMediaScaleChange: PropTypes.func,
		onSourceChange: PropTypes.func,
		postId: PropTypes.number,
		selectedItems: PropTypes.array,
		site: PropTypes.object.isRequired,
		sticky: PropTypes.bool,
		visible: PropTypes.bool.isRequired,
		photosPickerApiEnabled: PropTypes.bool,
		photosPickerSession: PropTypes.object,
		createPhotosPickerSession: PropTypes.func,
	};

	constructor( props ) {
		super( props );

		this.handleClick = this.onClick.bind( this );

		// The redux `isFetchingNextPage` state can bounce between true and false quickly.
		// We disable the refresh button if fetching and rather than have the button flicker
		// we debounce when debouncedFetching=false, but don't debounce when debouncedFetching=true - this means
		// our refresh button is disabled instantly but only enabled after the debounce time
		this.handleFetchOn = this.onSetFetch.bind( this );
		this.handleFetchOff = debounce( this.onDisableFetch.bind( this ), DEBOUNCE_TIME );

		this.state = {
			debouncedFetching: props.isFetchingNextPage,
		};
	}

	onSetFetch() {
		// We're now debouncedFetching - cancel any fetch=off debounce as we want the button to be disabled instantly
		this.handleFetchOff.cancel();
		this.setState( { debouncedFetching: true } );
	}

	onDisableFetch() {
		// This is debounced so we only enable the button DEBOUNCE_TIME after debouncedFetching is false
		this.setState( { debouncedFetching: false } );
	}

	componentWillUnmount() {
		// Cancel the debounce, just in case it fires after we've unmounted
		this.handleFetchOff.cancel();
	}

	componentDidUpdate() {
		if ( this.props.isFetchingNextPage === this.state.debouncedFetching ) {
			// don't force a re-update if already synced
			return;
		}

		if ( this.props.isFetchingNextPage ) {
			this.handleFetchOn();
		} else {
			this.handleFetchOff();
		}
	}

	onClick() {
		const { ID } = this.props.site;

		this.props.fetchNextMediaPage( ID );
		this.props.changeMediaSource( ID );
	}

	onCopy = () => {
		const { postId, site, selectedItems, source, onSourceChange } = this.props;

		onSourceChange( '', () => {
			this.props.addExternalMedia( selectedItems, site, postId, source );
		} );
	};

	onChangeSelection = () => {
		const { photosPickerSession, createPhotosPickerSession, deletePhotosPickerSession } =
			this.props;

		deletePhotosPickerSession && deletePhotosPickerSession( photosPickerSession?.id );
		createPhotosPickerSession && createPhotosPickerSession();
	};

	renderChangeSelectionButton() {
		const { photosPickerSession, translate } = this.props;

		return (
			<Button
				compact
				onClick={ this.onChangeSelection }
				disable={ ! photosPickerSession?.mediaItemsSet }
			>
				{ translate( 'Change selection' ) }
			</Button>
		);
	}

	renderCopyButton() {
		const { selectedItems, translate } = this.props;

		return (
			<Button compact disabled={ selectedItems.length === 0 } onClick={ this.onCopy } primary>
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
			source,
			onMediaScaleChange,
			translate,
			canCopy,
			hasRefreshButton,
			hasAttribution,
			photosPickerApiEnabled,
		} = this.props;

		return (
			<Card className="media-library__header">
				{ hasAttribution && this.renderPexelsAttribution() }

				{ hasRefreshButton && (
					<Button compact disabled={ this.state.debouncedFetching } onClick={ this.handleClick }>
						<Gridicon icon="refresh" size={ 24 } />

						{ translate( 'Refresh' ) }
					</Button>
				) }

				{ photosPickerApiEnabled &&
					source === 'google_photos' &&
					this.renderChangeSelectionButton() }
				{ canCopy && this.renderCopyButton() }

				<MediaLibraryScale onChange={ onMediaScaleChange } mediaScale={ this.props.mediaScale } />
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

const mapStateToProps = ( state, { site } ) => ( {
	isFetchingNextPage: isFetchingNextPage( state, site?.ID ),
} );

export default connect( mapStateToProps, {
	changeMediaSource,
	fetchNextMediaPage,
} )( localize( withAddExternalMedia( MediaLibraryExternalHeader ) ) );
