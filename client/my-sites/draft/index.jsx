/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';
import url from 'url';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { flow, noop, get } from 'lodash';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Gridicon from 'gridicons';
import photon from 'photon';
import { hasTouch } from 'lib/touch-detect';
import * as utils from 'state/posts/utils';
import { getSite } from 'state/sites/selectors';
import TimeSince from 'components/time-since';
import { getEditorUrl } from 'state/selectors/get-editor-url';

class Draft extends Component {
	static propTypes = {
		post: PropTypes.object,
		isPlaceholder: PropTypes.bool,
		onTitleClick: PropTypes.func,
		postImages: PropTypes.object,
		selected: PropTypes.bool,
		showAuthor: PropTypes.bool,

		// via `localize`
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		onTitleClick: noop,
		selected: false,
		showAuthor: false,
	};

	render() {
		const { post } = this.props;
		let image = null;
		let imageUrl, editPostURL;

		if ( this.props.isPlaceholder ) {
			return this.postPlaceholder();
		}

		if ( utils.userCan( 'edit_post', post ) ) {
			editPostURL = this.props.editorUrl;
		}

		if ( this.props.postImages && this.props.postImages.canonical_image ) {
			image = url.parse( this.props.postImages.canonical_image.uri, true );
			imageUrl = '//' + image.hostname + image.pathname + '?w=680px';
		}

		if ( post && post.canonical_image ) {
			image = url.parse( post.canonical_image.uri, true );

			if ( image.hostname.indexOf( 'files.wordpress.com' ) > 0 ) {
				imageUrl = '//' + image.hostname + image.pathname + '?w=680px';
			} else {
				imageUrl = photon( post.canonical_image.uri, { width: 680 } );
			}
		}

		const classes = classnames( 'draft', `is-${ post.format }`, {
			'has-image': !! image,
			'is-placeholder': this.props.isPlaceholder,
			'is-touch': hasTouch(),
			'is-selected': this.props.selected,
		} );

		const title = post.title || (
			<span className="draft__empty-text">{ this.props.translate( 'Untitled' ) }</span>
		);

		// Render each Post
		return (
			<CompactCard
				className={ classes }
				key={ 'draft-' + post.ID }
				href={ editPostURL }
				onClick={ this.props.onTitleClick }
			>
				<h3 className="draft__title">{ title }</h3>
				<TimeSince className="draft__time" date={ post.modified } />
				{ image ? this.renderImage( imageUrl ) : null }
			</CompactCard>
		);
	}

	renderImage( image ) {
		const style = { backgroundImage: 'url(' + image + ')' };
		return <div className="draft__featured-image" style={ style } />;
	}

	postPlaceholder() {
		return (
			<CompactCard className="draft is-placeholder">
				<h3 className="draft__title" />
				<div className="draft__actions">
					<p className="post-relative-time-status">
						<span className="time">
							<Gridicon icon="time" size={ 18 } />
							<span className="time-text" />
						</span>
					</p>
				</div>
			</CompactCard>
		);
	}
}

const mapState = ( state, { siteId, post } ) => ( {
	site: getSite( state, siteId ),
	editorUrl: getEditorUrl( state, siteId, get( post, 'ID' ) ),
} );

export default flow(
	localize,
	connect( mapState )
)( Draft );
