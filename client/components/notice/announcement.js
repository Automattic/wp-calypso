/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import ReactDOM from 'react-dom';

export class NoticeAnnouncement extends Component {
	static defaultProps = {
		spokenMessage: null,
		status: null,
		text: null,
	};

	static propTypes = {
		spokenMessage: PropTypes.string,
		status: PropTypes.oneOf( [ 'is-error', 'is-info', 'is-success', 'is-warning', 'is-plain' ] ),
		text: PropTypes.oneOfType( [
			PropTypes.arrayOf( PropTypes.oneOfType( [ PropTypes.string, PropTypes.node ] ) ),
			PropTypes.oneOfType( [ PropTypes.string, PropTypes.node ] ),
		] ),
	};

	constructor( props ) {
		super( props );
		this.container = document.getElementById( 'screen-reader-notice' );
	}

	render() {
		// @TODO use status to indicate assertiveness
		const { text, spokenMessage } = this.props;
		const message = spokenMessage || text;

		return ReactDOM.createPortal( message, this.container );
	}
}

export default NoticeAnnouncement;
