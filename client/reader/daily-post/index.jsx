/**
 * External Dependencies
 */
import React from 'react';
import classnames from 'classnames';
import page from 'page';
import qs from 'qs';
import { get, defer } from 'lodash';

/**
 * Internal Dependencies
 */
import { translate } from 'i18n-calypso';
import { preload } from 'sections-preload';
import SitesPopover from 'components/sites-popover';
import Button from 'components/button';
import Gridicon from 'components/gridicon';
import getSitesList from 'lib/sites-list';
import { recordGaEvent, recordAction, recordTrack } from 'reader/stats';
import { getDailyPostType } from './helper';

const sitesList = getSitesList();

function getPingbackAttributes( post ) {
	const typeTitles = {
		prompt: translate( 'Daily Prompt: ' ),
		photo: translate( 'Photo Challenge: ' ),
		discover: translate( 'Discover Challenge: ' )
	};
	const title = typeTitles[ getDailyPostType( post ) ] + post.title;

	return {
		title,
		url: post.URL
	};
}

function preventDefault( event ) {
	event.preventDefault();
}

function preloadEditor() {
	preload( 'post-editor' );
}

class DailyPostButton extends React.Component {
	constructor() {
		super();
		this.state = {
			showingMenu: false
		};

		this._closeTimerId = null;
		this._isMounted = false;

		[ 'pickSiteToPostTo', 'toggle', 'closeMenu' ].forEach(
			( method ) => this[ method ] = this[ method ].bind( this )
		);
	}

	static propTypes = {
		post: React.PropTypes.object.required,
		position: React.PropTypes.string,
		tagName: React.PropTypes.string
	}
	static defaultProps = {
		position: 'top',
		tagName: 'li'
	}

	componentDidMount() {
		this._isMounted = true;
	}

	componentWillUnmount() {
		this._isMounted = false;
		if ( this._closeTimerId ) {
			clearTimeout( this._closeTimerId );
			this._closeDefer = null;
		}
	}

	_deferMenuChange( showingMenu ) {
		if ( this._closeTimerId ) {
			clearTimeout( this._closeTimerId );
		}
		this._closeTimerId = defer( () => {
			this._closeTimerId = null;
			this.setState( { showingMenu } );
		} );
	}

	pickSiteToPostTo( siteSlug ) {
		recordAction( 'daily_post_challenge' );
		recordGaEvent( 'Clicked on Daily Post challenge' );
		recordTrack( 'calypso_reader_daily_post_challenge_to_site' );
		const pingbackAttributes = getPingbackAttributes( this.props.post );
		page( `/post/${ siteSlug }?${ qs.stringify( pingbackAttributes ) }` );
		return true;
	}

	toggle( event ) {
		preventDefault( event );
		if ( ! this.state.showingMenu ) {
			recordAction( 'open_daily_post_challenge' );
			recordGaEvent( 'Opened Daily Post Challenge' );
			recordTrack( 'calypso_reader_daily_post_challenge_opened' );
		}
		this._deferMenuChange( ! this.state.showingMenu );
	}

	closeMenu() {
		this.setState( { showingMenu: false } );
	}

	render() {
		const canParticipate = !! sitesList.getPrimary();
		const title = get( this.props, 'post.title' );
		const buttonClasses = classnames( {
			'reader__daily_post_button': true,
			'ignore-click': true,
			'is-active': this.state.showingMenu
		} );

		if ( ! canParticipate ) {
			return null;
		}

		return React.createElement( this.props.tagName, {
			className: 'reader__daily-post',
			onTouchTap: this.toggle,
			onClick: preventDefault,
			onTouchStart: preloadEditor,
			onMouseEnter: preloadEditor
		}, [
			( <Button ref="dailyPostButton" key="button" compact primary className={ buttonClasses }>
					<Gridicon icon="create" /><span>{ translate( 'Post about ' ) + title } </span>
				</Button> ),
			( this.state.showingMenu
				? <SitesPopover
					key="menu"
					header={ <div> { translate( 'Post on' ) } </div> }
					sites={ sitesList }
					context={ this.refs && this.refs.dailyPostButton }
					visible={ this.state.showingMenu }
					groups={ true }
					onSiteSelect={ this.pickSiteToPostTo }
					onClose={ this.closeMenu }
					position="top"
					className="is-reader"/>
				: null )
		] );
	}
}

export default DailyPostButton;
