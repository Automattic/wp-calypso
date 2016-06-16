/**
 * External dependencies
 */
 import React from 'react';
 import classNames from 'classnames';

/**
 * Internal dependencies
 */
import {
	recordPermalinkClick,
	recordGaEvent
} from 'reader/stats';

const PostExcerptLink = React.createClass( {

	propTypes: {
		siteName: React.PropTypes.string,
		postUrl: React.PropTypes.string
	},

	getInitialState() {
		return {
			isShowingNotice: false
		};
	},

	toggleNotice( event ) {
		event.preventDefault();
		this.setState( {
			isShowingNotice: ! this.state.isShowingNotice
		} );
	},

	recordClick() {
		recordPermalinkClick( 'summary_card_site_name' );
		recordGaEvent( 'Clicked Excerpt Notice Permalink' );
	},

	render() {
		if ( ! this.props.siteName || ! this.props.postUrl ) {
			return null;
		}

		const siteName = ( <a onClick={ this.recordClick } href={ this.props.postUrl } rel="external" target="_blank">
				<span className="post-excerpt-only-site-name">{ this.props.siteName || '(untitled)' }</span>
			</a> );
		const classes = classNames( {
			'post-excerpt-link': true,
			'is-showing-notice': this.state.isShowingNotice
		} );

		return (
			<div className={ classes }>
				{ this.translate( 'Visit {{siteName/}} for the full post', { components: { siteName } } ) }
				<svg onClick={ this.toggleNotice } className="gridicon gridicon__help ignore-click" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" enableBackground="new 0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-2h2v2zm2.003-6.41c-.23.36-.6.704-1.108 1.028-.43.28-.7.482-.808.61-.108.13-.163.283-.163.46V13H11.04v-.528c0-.4.08-.74.245-1.017.163-.276.454-.546.872-.808.332-.21.57-.397.716-.565.145-.168.217-.36.217-.577 0-.172-.077-.308-.233-.41-.156-.1-.358-.15-.608-.15-.62 0-1.342.22-2.17.658l-.854-1.67c1.02-.58 2.084-.872 3.194-.872.913 0 1.63.202 2.15.603.52.4.78.948.78 1.64 0 .495-.116.924-.347 1.286z"/></svg>
				<p className="post-excerpt-link__helper">
					{ this.translate( 'The owner of this site only allows us to show a brief summary of their content. To view the full post, you\'ll have to visit their site.' ) }
				</p>
			</div>
		);
	}
} );

export default PostExcerptLink;
