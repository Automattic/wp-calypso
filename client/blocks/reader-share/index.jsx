import { Button, Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { defer } from 'lodash';
import PropTypes from 'prop-types';
import { createRef, Component } from 'react';
import { connect } from 'react-redux';
import ReaderShareIcon from 'calypso/reader/components/icons/share-icon';
import * as stats from 'calypso/reader/stats';
import { preloadEditor } from 'calypso/sections-preloaders';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import ReaderReblogSelection from './reblog';
import ReaderSocialShareSelection from './social';
import './style.scss';

class ReaderShare extends Component {
	static propTypes = {
		iconSize: PropTypes.number,
	};

	static defaultProps = {
		position: 'bottom',
		iconSize: 20,
	};

	state = {
		showingMenu: false,
	};

	constructor( props ) {
		super( props );
		this.mounted = false;
		this.shareButton = createRef();
	}

	componentDidMount() {
		this.mounted = true;
	}

	componentWillUnmount() {
		if ( this.closeHandle ) {
			clearTimeout( this.closeHandle );
			this.closeHandle = null;
		}
		this.mounted = false;
	}

	deferMenuChange = ( showing ) => {
		if ( this.closeHandle ) {
			clearTimeout( this.closeHandle );
		}

		this.closeHandle = defer( () => {
			this.closeHandle = null;
			this.setState( { showingMenu: showing } );
		} );
	};

	toggle = () => {
		if ( ! this.state.showingMenu ) {
			const actionName = this.props.isReblogSelection ? 'open_reader_reblog' : 'open_share';
			const eventName = this.props.isReblogSelection ? 'Opened Reader Reblog' : 'Opened Share';
			const trackName = this.props.isReblogSelection
				? 'calypso_reader_reblog_opened'
				: 'calypso_reader_share_opened';
			stats.recordAction( actionName );
			stats.recordGaEvent( eventName );
			this.props.recordReaderTracksEvent( trackName, {
				has_sites: this.props.hasSites,
			} );
		}
		this.deferMenuChange( ! this.state.showingMenu );
	};

	closeMenu = () => {
		// have to defer this to let the mouseup / click escape.
		// If we don't defer and remove the DOM node on this turn of the event loop,
		// Chrome (at least) will not fire the click
		if ( this.mounted ) {
			this.deferMenuChange( false );
		}
	};

	render() {
		const buttonClasses = classnames( {
			'reader-share__button': true,
			'ignore-click': true,
			'is-active': this.state.showingMenu,
		} );

		const popoverProps = {
			key: 'menu',
			context: this.shareButton.current,
			isVisible: this.state.showingMenu,
			position: this.props.position,
			className: 'popover reader-share__popover',
		};

		// The event.preventDefault() on the wrapping div is needed to prevent the
		// full post opening when a share method is selected in the popover
		return (
			// eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
			<div className="reader-share" onClick={ ( event ) => event.preventDefault() }>
				<Button
					borderless
					className={ buttonClasses }
					compact={ this.props.iconSize === 18 }
					key="button"
					onClick={ this.toggle }
					onMouseEnter={ preloadEditor }
					onTouchStart={ preloadEditor }
					ref={ this.shareButton }
				>
					{ ! this.props.isReblogSelection ? (
						ReaderShareIcon( {
							iconSize: this.props.iconSize,
						} )
					) : (
						<Gridicon icon="reblog" size={ this.props.iconSize } />
					) }
				</Button>
				{ this.state.showingMenu &&
					( ! this.props.isReblogSelection ? (
						<ReaderSocialShareSelection
							post={ this.props.post }
							popoverProps={ popoverProps }
							closeMenu={ this.closeMenu }
						/>
					) : (
						<ReaderReblogSelection
							post={ this.props.post }
							comment={ this.props.comment }
							popoverProps={ popoverProps }
							closeMenu={ this.closeMenu }
						/>
					) ) }
			</div>
		);
	}
}

const mapStateToProps = ( state ) => {
	return {
		hasSites: !! getPrimarySiteId( state ),
	};
};

const mapDispatchToProps = { recordReaderTracksEvent };

export default connect( mapStateToProps, mapDispatchToProps )( localize( ReaderShare ) );
