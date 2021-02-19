/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import Gridicon from 'calypso/components/gridicon';
import { debounce } from 'lodash';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import MediaLibraryScale from './scale';
import { Card, Button } from '@automattic/components';
import StickyPanel from 'calypso/components/sticky-panel';
import { addExternalMedia, fetchNextMediaPage } from 'calypso/state/media/thunks';
import { changeMediaSource } from 'calypso/state/media/actions';
import isFetchingNextPage from 'calypso/state/selectors/is-fetching-next-page';

const DEBOUNCE_TIME = 250;

class MediaLibraryExternalHeader extends React.Component {
	static propTypes = {
		onMediaScaleChange: PropTypes.func,
		site: PropTypes.object.isRequired,
		visible: PropTypes.bool.isRequired,
		canCopy: PropTypes.bool,
		selectedItems: PropTypes.array,
		onSourceChange: PropTypes.func,
		sticky: PropTypes.bool,
		hasAttribution: PropTypes.bool,
		hasRefreshButton: PropTypes.bool,
		isFetchingNextPage: PropTypes.bool,
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
		const { site, selectedItems, source, onSourceChange } = this.props;

		onSourceChange( '', () => {
			this.props.addExternalMedia( selectedItems, site, source );
		} );
	};

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
		const { onMediaScaleChange, translate, canCopy, hasRefreshButton, hasAttribution } = this.props;

		return (
			<Card className="media-library__header">
				{ hasAttribution && this.renderPexelsAttribution() }

				{ hasRefreshButton && (
					<Button compact disabled={ this.state.debouncedFetching } onClick={ this.handleClick }>
						<Gridicon icon="refresh" size={ 24 } />

						{ translate( 'Refresh' ) }
					</Button>
				) }

				{ canCopy && this.renderCopyButton() }

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

const mapStateToProps = ( state, { site } ) => ( {
	isFetchingNextPage: isFetchingNextPage( state, site?.ID ),
} );

export default connect( mapStateToProps, {
	addExternalMedia,
	changeMediaSource,
	fetchNextMediaPage,
} )( localize( MediaLibraryExternalHeader ) );
