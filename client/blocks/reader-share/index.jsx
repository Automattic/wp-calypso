/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { defer } from 'lodash';
import config from 'config';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import page from 'page';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ReaderPopoverMenu from 'reader/components/reader-popover/menu';
import PopoverMenuItem from 'components/popover/menu-item';
import Gridicon from 'components/gridicon';
import SocialLogo from 'components/social-logo';
import * as stats from 'reader/stats';
import { preload } from 'sections-helper';
import SiteSelector from 'components/site-selector';
import getPrimarySiteId from 'state/selectors/get-primary-site-id';

/**
 * Style dependencies
 */
import './style.scss';

function preloadEditor() {
	preload( 'post-editor' );
}

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

	const params = new URLSearchParams( args );
	return params.toString();
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

	toggle = ( event ) => {
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

		return React.createElement(
			this.props.tagName,
			{
				className: 'reader-share',
				onClick: this.toggle,
				onTouchStart: preloadEditor,
				onMouseEnter: preloadEditor,
			},
			[
				<span key="button" ref={ this.shareButton } className={ buttonClasses }>
					<Gridicon icon="share" size={ this.props.iconSize } />
					<span className="reader-share__button-label">
						{ translate( 'Share', { comment: 'Share the post' } ) }
					</span>
				</span>,
				this.state.showingMenu && (
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
				),
			]
		);
	}
}

export default connect( ( state ) => ( {
	hasSites: !! getPrimarySiteId( state ),
} ) )( localize( ReaderShare ) );
