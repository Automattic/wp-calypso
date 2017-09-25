/** @format */
/**
 * External dependencies
 */
import classnames from 'classnames';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { defer } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import qs from 'qs';
import React from 'react';
import { connect } from 'react-redux';
import SocialLogo from 'social-logos';

/**
 * Internal dependencies
 */
import PopoverMenuItem from 'components/popover/menu-item';
import ReaderPopoverMenu from 'components/reader-popover/menu';
import SiteSelector from 'components/site-selector';
import config from 'config';
import * as stats from 'reader/stats';
import { preload as preloadSection } from 'sections-preload';
import { getPrimarySiteId } from 'state/selectors';
import url from 'url';

/**
 * Local variables
 */
const actionMap = {
	twitter( post ) {
		const twitterUrlProperties = {
			scheme: 'https',
			hostname: 'twitter.com',
			pathname: '/intent/tweet',
			query: {
				text: post.title,
				url: post.URL,
				via: 'wordpressdotcom',
			},
		};

		const twitterUrl = url.format( twitterUrlProperties );

		window.open( twitterUrl, 'twitter', 'width=550,height=420,resizeable,scrollbars' );
	},
	facebook( post ) {
		const facebookUrlProperties = {
			scheme: 'https',
			hostname: 'www.facebook.com',
			pathname: '/sharer.php',
			query: {
				u: post.URL,
				app_id: config( 'facebook_api_key' ),
			},
		};

		const facebookUrl = url.format( facebookUrlProperties );

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

	return qs.stringify( args );
}

class ReaderShare extends React.Component {
	static propTypes = {
		iconSize: PropTypes.number,
	};

	static defaultProps = {
		position: 'bottom',
		tagName: 'li',
		iconSize: 24,
	};

	state = {
		showingMenu: false,
	};

	constructor( props ) {
		super( props );
		this.mounted = false;
	}

	componentWillMount() {
		this.mounted = true;
	}

	componentWillUnmount() {
		if ( this.closeHandle ) {
			clearTimeout( this.closeHandle );
			this.closeHandle = null;
		}
		this.mounted = false;
	}

	deferMenuChange = showing => {
		if ( this.closeHandle ) {
			clearTimeout( this.closeHandle );
		}

		this.closeHandle = defer( () => {
			this.closeHandle = null;
			this.setState( { showingMenu: showing } );
		} );
	};

	toggle = event => {
		event.preventDefault();
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

	pickSiteToShareTo = slug => {
		stats.recordAction( 'share_wordpress' );
		stats.recordGaEvent( 'Clicked on Share to WordPress' );
		stats.recordTrack( 'calypso_reader_share_to_site' );
		page( `/post/${ slug }?` + buildQuerystringForPost( this.props.post ) );
		return true;
	};

	closeExternalShareMenu = action => {
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

	preloadEditor() {
		preloadSection( 'post-editor' );
	}

	render() {
		const { translate } = this.props;
		const buttonClasses = classnames( {
			'reader-share__button': true,
			'ignore-click': true,
			'is-active': this.state.showingMenu,
		} );

		return React.createElement(
			this.props.tagName,
			{
				className: 'reader-share',
				onClick: this.toggle,
				onTouchStart: this.preloadEditor,
				onMouseEnter: this.preloadEditor,
				ref: 'shareButton',
			},
			[
				<span key="button" ref="shareButton" className={ buttonClasses }>
					<Gridicon icon="share" size={ this.props.iconSize } />
					<span className="reader-share__button-label">
						{ translate( 'Share', { comment: 'Share the post' } ) }
					</span>
				</span>,
				this.state.showingMenu && (
					<ReaderPopoverMenu
						key="menu"
						context={ this.refs && this.refs.shareButton }
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
								siteBasePath="/post"
								onSiteSelect={ this.pickSiteToShareTo }
								showAddNewSite={ false }
								indicator={ false }
								autoFocus={ false }
								groups={ true }
							/>
						) }
					</ReaderPopoverMenu>
				),
			]
		);
	}
}

export default connect( state => ( {
	hasSites: !! getPrimarySiteId( state ),
} ) )( localize( ReaderShare ) );
