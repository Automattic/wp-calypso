import config from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import classnames from 'classnames';
import { localize, translate } from 'i18n-calypso';
import { defer } from 'lodash';
import PropTypes from 'prop-types';
import { createRef, Component } from 'react';
import { connect } from 'react-redux';
import ReaderShareIcon from 'calypso/reader/components/icons/share-icon';
import * as stats from 'calypso/reader/stats';
import { preloadEditor } from 'calypso/sections-preloaders';
import { infoNotice } from 'calypso/state/notices/actions';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import ReaderReblogSelection from './reblog';
import ReaderSocialShareSelection from './social';
import './style.scss';

/**
 * Local variables
 */
const actionMap = {
	twitter( post ) {
		const baseUrl = new URL( 'https://twitter.com/intent/tweet' );
		const params = new URLSearchParams( {
			text: post.title,
			url: post.URL,
		} );
		baseUrl.search = params.toString();

		const twitterUrl = baseUrl.href;

		window.open( twitterUrl, 'twitter', 'width=550,height=420,resizeable,scrollbars' );
	},
	facebook( post ) {
		const baseUrl = new URL( 'https://www.facebook.com/sharer.php' );
		const params = new URLSearchParams( {
			u: post.URL,
			app_id: config( 'facebook_api_key' ),
		} );
		baseUrl.search = params.toString();

		const facebookUrl = baseUrl.href;

		window.open( facebookUrl, 'facebook', 'width=626,height=436,resizeable,scrollbars' );
	},
	copy_link() {},
};

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
			stats.recordAction( 'open_share' );
			stats.recordGaEvent( 'Opened Share' );
			stats.recordTrack( 'calypso_reader_share_opened', {
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

	closeExternalShareMenu = ( action ) => {
		this.closeMenu();
		const actionFunc = actionMap[ action ];
		if ( actionFunc ) {
			stats.recordAction( 'share_' + action );
			stats.recordGaEvent( 'Clicked on Share to ' + action );
			stats.recordTrack( 'calypso_reader_share_action_picked', {
				action: action,
			} );
			actionFunc( this.props.post );
		}
	};

	render() {
		const { onCopyLinkClick } = this.props;
		const buttonClasses = classnames( {
			'reader-share__button': true,
			'ignore-click': true,
			'is-active': this.state.showingMenu,
		} );

		const popoverProps = {
			key: 'menu',
			context: this.shareButton.current,
			isVisible: this.state.showingMenu,
			onClose: this.closeExternalShareMenu,
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
					{ ReaderShareIcon( {
						iconSize: this.props.iconSize,
					} ) }
				</Button>
				{ this.state.showingMenu &&
					( ! this.props.isReblogSelection ? (
						<ReaderSocialShareSelection
							post={ this.props.post }
							onCopyLinkClick={ onCopyLinkClick }
							popoverProps={ popoverProps }
						/>
					) : (
						<ReaderReblogSelection post={ this.props.post } popoverProps={ popoverProps } />
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

const mapDispatchToProps = { infoNotice };

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	const onCopyLinkClick = () => {
		dispatchProps.infoNotice( translate( 'Link copied to clipboard.' ), { duration: 3000 } );
	};
	return Object.assign( {}, ownProps, stateProps, dispatchProps, { onCopyLinkClick } );
};

export default connect(
	mapStateToProps,
	mapDispatchToProps,
	mergeProps
)( localize( ReaderShare ) );
