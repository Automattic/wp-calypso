/**
 * External Dependencies
 */
import React from 'react';
import classnames from 'classnames';
import page from 'page';
import PropTypes from 'prop-types';
import { stringify } from 'qs';
import { get, defer } from 'lodash';
import Gridicon from 'components/gridicon';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import AsyncLoad from 'components/async-load';
import { translate } from 'i18n-calypso';
import { preload } from 'sections-helper';
import { Button } from '@automattic/components';
import { markPostSeen } from 'state/reader/posts/actions';
import { recordGaEvent, recordAction, recordTrackForPost } from 'reader/stats';
import { getDailyPostType } from './helper';
import getPrimarySiteId from 'state/selectors/get-primary-site-id';
import { getSiteSlug } from 'state/sites/selectors';
import { getCurrentUser } from 'state/current-user/selectors';

/**
 * Style dependencies
 */
import './style.scss';

function getPingbackAttributes( post ) {
	const typeTitles = {
		prompt: translate( 'Daily Prompt: ' ),
		photo: translate( 'Photo Challenge: ' ),
		discover: translate( 'Discover Challenge: ' ),
	};
	const title = typeTitles[ getDailyPostType( post ) ] + post.title;

	return {
		title,
		url: post.URL,
	};
}

function preloadEditor() {
	preload( 'post-editor' );
}

export class DailyPostButton extends React.Component {
	constructor() {
		super();
		this.state = {
			showingMenu: false,
		};

		this._closeTimerId = null;
		this._isMounted = false;
		this.dailyPostButtonRef = React.createRef();
	}

	static propTypes = {
		post: PropTypes.object.isRequired,
		site: PropTypes.object.isRequired,
		position: PropTypes.string,
		tagName: PropTypes.string,
		canParticipate: PropTypes.bool.isRequired,
		primarySiteSlug: PropTypes.string,
		onlyOneSite: PropTypes.bool.isRequired,
	};

	static defaultProps = {
		position: 'top',
		tagName: 'span',
	};

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

	deferMenuChange( showingMenu ) {
		if ( this._closeTimerId ) {
			clearTimeout( this._closeTimerId );
		}
		this._closeTimerId = defer( () => {
			this._closeTimerId = null;
			this.setState( { showingMenu } );
		} );
	}

	openEditorWithSite = ( siteSlug ) => {
		const pingbackAttributes = getPingbackAttributes( this.props.post );

		recordAction( 'daily_post_challenge' );
		recordGaEvent( 'Clicked on Daily Post challenge' );
		recordTrackForPost( 'calypso_reader_daily_post_challenge_site_picked', this.props.post );

		this.props.markPostSeen( this.props.post, this.props.site );

		page( `/post/${ siteSlug }?${ stringify( pingbackAttributes ) }` );
		return true;
	};

	toggle = ( event ) => {
		event.preventDefault();
		if ( ! this.state.showingMenu ) {
			recordAction( 'open_daily_post_challenge' );
			recordGaEvent( 'Opened Daily Post Challenge' );
			recordTrackForPost( 'calypso_reader_daily_post_challenge_opened', this.props.post );

			if ( this.props.onlyOneSite ) {
				return this.openEditorWithSite( this.props.primarySiteSlug );
			}
		}
		this.deferMenuChange( ! this.state.showingMenu );
	};

	closeMenu = () => {
		// have to defer this to let the mouseup / click escape.
		// If we don't defer and remove the DOM node on this turn of the event loop,
		// Chrome (at least) will not fire the click
		if ( this._isMounted ) {
			this.deferMenuChange( false );
		}
	};

	renderSitesPopover = () => {
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<AsyncLoad
				require="components/sites-popover"
				placeholder={ null }
				key="menu"
				header={ <div> { translate( 'Post on' ) } </div> }
				context={ this.dailyPostButtonRef.current }
				visible={ this.state.showingMenu }
				groups={ true }
				onSiteSelect={ this.openEditorWithSite }
				onClose={ this.closeMenu }
				position="top"
				className="is-reader"
			/>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	};

	render() {
		const title = get( this.props, 'post.title' );
		const buttonClasses = classnames( {
			'daily-post-button__button': true,
			'ignore-click': true,
			'is-active': this.state.showingMenu,
		} );

		if ( ! this.props.canParticipate ) {
			return null;
		}

		return React.createElement(
			this.props.tagName,
			{
				className: 'daily-post-button',
				onClick: this.toggle,
				onTouchStart: preloadEditor,
				onMouseEnter: preloadEditor,
			},
			[
				<Button
					ref={ this.dailyPostButtonRef }
					key="button"
					compact
					primary
					className={ buttonClasses }
				>
					<Gridicon icon="create" />
					<span>{ translate( 'Post about %(title)s', { args: { title } } ) } </span>
				</Button>,
				this.state.showingMenu ? this.renderSitesPopover() : null,
			]
		);
	}
}

export default connect(
	( state ) => {
		const primarySiteId = getPrimarySiteId( state );
		const user = getCurrentUser( state );
		const visibleSiteCount = get( user, 'visible_site_count', 0 );
		return {
			canParticipate: !! primarySiteId,
			primarySiteSlug: getSiteSlug( state, primarySiteId ),
			onlyOneSite: visibleSiteCount === 1,
		};
	},
	{ markPostSeen }
)( DailyPostButton );
