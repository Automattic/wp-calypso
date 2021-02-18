/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';
import url from 'url';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { noop, get } from 'lodash';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import photon from 'photon';
import { hasTouch } from 'calypso/lib/touch-detect';
import * as utils from 'calypso/state/posts/utils';
import TimeSince from 'calypso/components/time-since';
import { getEditorUrl } from 'calypso/state/selectors/get-editor-url';

/**
 * Style dependencies
 */
import './style.scss';

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
		let imageUrl;
		let editPostURL;

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
				key={ post.ID }
				href={ editPostURL }
				onClick={ this.props.onTitleClick }
			>
				<h3 className="draft__title">{ title }</h3>
				<TimeSince className="draft__time" date={ post.modified } />
				{ image && this.renderImage( imageUrl ) }
			</CompactCard>
		);
	}

	renderImage( image ) {
		const style = { backgroundImage: 'url(' + image + ')' };
		return <div className="draft__featured-image" style={ style } />;
	}

	postPlaceholder() {
		return (
			/* eslint-disable jsx-a11y/heading-has-content */
			<CompactCard className="draft is-placeholder">
				<h3 className="draft__title" />
			</CompactCard>
			/* eslint-enable jsx-a11y/heading-has-content */
		);
	}
}

export default connect( ( state, { siteId, post } ) => ( {
	editorUrl: getEditorUrl( state, siteId, get( post, 'ID' ) ),
} ) )( localize( Draft ) );
