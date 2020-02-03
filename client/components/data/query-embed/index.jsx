/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestEmbed } from 'state/embeds/actions';

class QueryEmbeds extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		url: PropTypes.string.isRequired,
	};

	componentDidMount() {
		this.props.requestEmbed( this.props.siteId, this.props.url );
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.siteId !== this.props.siteId || prevProps.url !== this.props.url ) {
			this.props.requestEmbed( this.props.siteId, this.props.url );
		}
	}

	render() {
		return null;
	}
}

export default connect( null, {
	requestEmbed,
} )( QueryEmbeds );
