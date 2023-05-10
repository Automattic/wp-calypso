import config from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import classnames from 'classnames';
import { localize, translate } from 'i18n-calypso';
import { defer } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import { createRef, Component } from 'react';
import { connect } from 'react-redux';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import PopoverMenuItemClipboard from 'calypso/components/popover-menu/item-clipboard';
import SiteSelector from 'calypso/components/site-selector';
import ReaderFacebookIcon from 'calypso/reader/components/icons/facebook-icon';
import ReaderShareIcon from 'calypso/reader/components/icons/share-icon';
import ReaderTwitterIcon from 'calypso/reader/components/icons/twitter-icon';
import ReaderPopoverMenu from 'calypso/reader/components/reader-popover/menu';
import * as stats from 'calypso/reader/stats';
import { preloadEditor } from 'calypso/sections-preloaders';
import { infoNotice } from 'calypso/state/notices/actions';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';

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

function buildQuerystringForPost( post ) {
	const args = {};

	args.title = `${ post.title } — ${ post.site_name }`;
	args.url = post.URL;
	args.is_post_share = true; // There is a dependency on this here https://github.com/Automattic/wp-calypso/blob/a69ded693a99fa6a957b590b1a538f32a581eb8a/client/gutenberg/editor/controller.js#L209

	const params = new URLSearchParams( args );
	return params.toString();
}

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

	pickSiteToShareTo = ( slug ) => {
		stats.recordAction( 'share_wordpress' );
		stats.recordGaEvent( 'Clicked on Share to WordPress' );
		stats.recordTrack( 'calypso_reader_share_to_site' );
		page( `/post/${ slug }?` + buildQuerystringForPost( this.props.post ) );
		return true;
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
				{ this.state.showingMenu && (
					<ReaderPopoverMenu
						key="menu"
						context={ this.shareButton.current }
						isVisible={ this.state.showingMenu }
						onClose={ this.closeExternalShareMenu }
						position={ this.props.position }
						className="popover reader-share__popover"
						popoverTitle={ translate( 'Share on' ) }
					>
						<PopoverMenuItem
							action="facebook"
							className="reader-share__popover-item"
							title={ translate( 'Share on Facebook' ) }
							focusOnHover={ false }
						>
							<ReaderFacebookIcon iconSize={ 20 } />
							<span>Facebook</span>
						</PopoverMenuItem>
						<PopoverMenuItem
							action="twitter"
							className="reader-share__popover-item"
							title={ translate( 'Share on Twitter' ) }
							focusOnHover={ false }
						>
							<ReaderTwitterIcon iconSize={ 20 } />
							<span>Twitter</span>
						</PopoverMenuItem>
						<PopoverMenuItemClipboard
							action="copy_link"
							text={ this.props.post.URL }
							onCopy={ onCopyLinkClick }
							icon="link"
						>
							{ translate( 'Copy link' ) }
						</PopoverMenuItemClipboard>
						{ this.props.hasSites && (
							<SiteSelector
								className="reader-share__site-selector"
								onSiteSelect={ this.pickSiteToShareTo }
								groups
							/>
						) }
					</ReaderPopoverMenu>
				) }
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
