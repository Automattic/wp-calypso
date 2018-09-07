/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { createGutenbergPostDraft } from 'state/gutenberg/actions';

export class QueryGutenbergCreatePost extends Component {
	static propTypes = {
		siteId: PropTypes.number,
	};

	componentDidMount() {
		this.request();
	}

	componentDidUpdate( { siteId } ) {
		if ( siteId !== this.props.siteId ) {
			this.request();
		}
	}

	request() {
		const { siteId, createGutenbergPostDraft: dispatchCreateGutenbergPostDraft } = this.props;
		if ( siteId ) {
			dispatchCreateGutenbergPostDraft( siteId );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	null,
	{ createGutenbergPostDraft }
)( QueryGutenbergCreatePost );
