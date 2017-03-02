/**
 * External Dependencies
 */
import React, { PureComponent } from 'react';
import ReactDom from 'react-dom';
import classnames from 'classnames';
import url from 'url';
import { localize } from 'i18n-calypso';
import closest from 'component-closest';

/**
 * Internal Dependencies
 */
import Card from 'components/card';
import SiteAndAuthorIcon from 'reader/site-and-author-icon';

class CrossPost extends PureComponent {

	static propTypes = {
		post: React.PropTypes.object.isRequired,
		isSelected: React.PropTypes.bool.isRequired,
		xMetadata: React.PropTypes.object.isRequired,
		xPostedTo: React.PropTypes.array,
		handleClick: React.PropTypes.func.isRequired,
		translate: React.PropTypes.func.isRequried,
	}

	handleTitleClick = ( event ) => {
		// modified clicks should let the default action open a new tab/window
		if ( event.button > 0 || event.metaKey || event.controlKey || event.shiftKey || event.altKey ) {
			return;
		}
		event.preventDefault();
		this.props.handleClick( this.props.xMetadata );
	}

	handleCardClick = ( event ) => {
		const rootNode = ReactDom.findDOMNode( this );

		if ( closest( event.target, '.should-scroll', true, rootNode ) ) {
			setTimeout( function() {
				window.scrollTo( 0, 0 );
			}, 100 );
		}

		if ( closest( event.target, '.ignore-click', true, rootNode ) ) {
			return;
		}

		// ignore clicks on anchors inside inline content
		if ( closest( event.target, 'a', true, rootNode ) && closest( event.target, '.reader__x-post', true, rootNode ) ) {
			return;
		}

		// if the click has modifier, ignore it
		if ( event.metaKey || event.controlKey || event.shiftKey || event.altKey ) {
			return;
		}

		// programattic ignore
		if ( ! event.defaultPrevented ) { // some child handled it
			event.preventDefault();
			this.props.handleClick( this.props.xMetadata );
		}
	}

	getSiteNameFromURL = ( siteURL ) => {
		return `+${ url.parse( siteURL ).hostname.split( '.' )[ 0 ] }`;
	}

	getDescription = ( authorFirstName ) => {
		let label;
		const siteName = this.getSiteNameFromURL( this.props.xMetadata.siteURL );
		const isCrossComment = !! this.props.xMetadata.commentURL;
		if ( isCrossComment ) {
			label = this.props.translate( '{{author}}%(authorFirstName)s{{/author}} {{label}}left a comment on %(siteName)s, cross-posted to{{/label}} {{blogNames/}}', {
				args: {
					siteName: siteName,
					authorFirstName: authorFirstName
				},
				components: {
					author: <span className="reader__x-post-author" />,
					label: <span className="reader__x-post-label" />,
					blogNames: this.getXPostedToContent()
				}
			} );
		} else {
			label = this.props.translate( '{{author}}%(authorFirstName)s{{/author}} {{label}}cross-posted from %(siteName)s to{{/label}} {{blogNames/}}', {
				args: {
					siteName: siteName,
					authorFirstName: authorFirstName
				},
				components: {
					author: <span className="reader__x-post-author" />,
					label: <span className="reader__x-post-label" />,
					blogNames: this.getXPostedToContent()
				}
			} );
		}
		return label;
	}

	getXPostedToContent = () => {
		let xPostedToList = this.props.xPostedTo;
		if ( ! xPostedToList || xPostedToList.length === 0 ) {
			xPostedToList = [ {
				siteURL: this.props.post.site_URL,
				siteName: this.getSiteNameFromURL( this.props.post.site_URL )
			} ];
		}
		return xPostedToList.map( ( xPostedTo, index, array ) => {
			return (
				<span className="reader__x-post-site" key={ xPostedTo.siteURL + '-' + index }>
					{ xPostedTo.siteName }
					{ index + 2 < array.length ? <span>, </span> : null }
					{ index + 2 === array.length ?
						<span> { this.props.translate( 'and', { comment: 'last conjuction in a list of blognames: (blog1, blog2,) blog3 _and_ blog4' } ) } </span> : null }
				</span>
			);
		} );
	}

	render() {
		const post = this.props.post,
			articleClasses = classnames( {
				reader__card: true,
				'is-x-post': true,
				'is-selected': this.props.isSelected
			} );

		// Remove the x-post text from the title.
		// TODO: maybe add xpost metadata, so we can remove this regex
		let xpostTitle = post.title;
		xpostTitle = xpostTitle.replace( /x-post:/i, '' );

		return (
			<Card tagName="article" onClick={ this.handleCardClick } className={ articleClasses }>
				<SiteAndAuthorIcon
					siteId={ this.props.post.site_ID }
					isExternal={ this.props.post.is_external }
					user={ post.author }
					onClick={ this.handleTitleClick }
					href={ post.URL } />
				<div className="reader__x-post">
					{ post.title &&
						<h1 className="reader__post-title">
							<a className="reader__post-title-link" onClick={ this.handleTitleClick } href={ post.URL } target="_blank" rel="noopener noreferrer">{ xpostTitle }</a>
						</h1>
						}
					{ this.getDescription( post.author.first_name ) }
				</div>
			</Card> );
	}
}

module.exports = localize( CrossPost );
