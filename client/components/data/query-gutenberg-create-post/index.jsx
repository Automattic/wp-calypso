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
import { createDraft } from 'state/gutenberg/actions';

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
		const { siteId, createDraft: dispatchCreateDraft } = this.props;
		if ( siteId ) {
			dispatchCreateDraft( siteId );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	null,
	{ createDraft }
)( QueryGutenbergCreatePost );
