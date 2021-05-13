/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { defer } from 'lodash';
import config from '@automattic/calypso-config';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import page from 'page';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ReaderPopoverMenu from 'calypso/reader/components/reader-popover/menu';
import PopoverMenuItem from 'calypso/components/popover/menu-item';
import Gridicon from 'calypso/components/gridicon';
import SocialLogo from 'calypso/components/social-logo';
import * as stats from 'calypso/reader/stats';
import { preloadEditor } from 'calypso/sections-preloaders';
import SiteSelector from 'calypso/components/site-selector';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import { Button } from '@automattic/components';

/**
 * Style dependencies
 */
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
};

function buildQuerystringForPost( post ) {
	const args = {};

	if ( post.content_embeds && post.content_embeds.length ) {
		args.embed = post.content_embeds[ 0 ].embedUrl || post.content_embeds[ 0 ].src;
	}
	if ( post.canonical_image && post.canonical_image.uri ) {
		args.image = post.canonical_image.uri;
	}

	args.title = `${ post.title } — ${ post.site_name }`;
	args.text = post.excerpt;
	args.url = post.URL;
	args.is_post_share = true; // There is a dependency on this here https://github.com/Automattic/wp-calypso/blob/a69ded693a99fa6a957b590b1a538f32a581eb8a/client/gutenberg/editor/controller.js#L209

	const params = new URLSearchParams( args );
	return params.toString();
}

class ReaderShare extends React.Component {
	static propTypes = {
		iconSize: PropTypes.number,
	};

	static defaultProps = {
		position: 'bottom',
		iconSize: 24,
	};

	state = {
		showingMenu: false,
	};

	constructor( props ) {
		super( props );
		this.mounted = false;
		this.shareButton = React.createRef();
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
		const { translate } = this.props;
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
					<Gridicon aria-hidden="true" icon="share" />
					<span className="reader-share__button-label">
						{ translate( 'Share', { comment: 'Share the post' } ) }
					</span>
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
							<SocialLogo icon="facebook" />
							<span>Facebook</span>
						</PopoverMenuItem>
						<PopoverMenuItem
							action="twitter"
							className="reader-share__popover-item"
							title={ translate( 'Share on Twitter' ) }
							focusOnHover={ false }
						>
							<SocialLogo icon="twitter" />
							<span>Twitter</span>
						</PopoverMenuItem>
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

export default connect( ( state ) => ( {
	hasSites: !! getPrimarySiteId( state ),
} ) )( localize( ReaderShare ) );
