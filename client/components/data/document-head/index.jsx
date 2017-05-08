/**
 * External dependencies.
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { isEqual } from 'lodash';

/**
 * Internal dependencies.
 */
import { getDocumentHeadFormattedTitle } from 'state/document-head/selectors';
import {
	setDocumentHeadTitle as setTitle,
	setDocumentHeadLink as setLink,
	setDocumentHeadMeta as setMeta,
	setDocumentHeadUnreadCount as setUnreadCount
} from 'state/document-head/actions';

class DocumentHead extends Component {
	componentWillMount() {
		const {
			title,
			unreadCount
		} = this.props;

		if ( this.props.title !== undefined ) {
			this.props.setTitle( title );
		}

		if ( this.props.unreadCount !== undefined ) {
			this.props.setUnreadCount( unreadCount );
		}

		if ( this.props.link !== undefined ) {
			this.props.setLink( this.props.link );
		}

		if ( this.props.meta !== undefined ) {
			this.props.setMeta( this.props.meta );
		}
	}

	componentDidMount() {
		const { formattedTitle } = this.props;
		document.title = formattedTitle;
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.title !== undefined && this.props.title !== nextProps.title ) {
			this.props.setTitle( nextProps.title );
		}

		if ( nextProps.unreadCount !== undefined && this.props.unreadCount !== nextProps.unreadCount ) {
			this.props.setUnreadCount( nextProps.unreadCount );
		}

		if ( nextProps.link !== undefined && ! isEqual( this.props.link, nextProps.link ) ) {
			this.props.setLink( nextProps.link );
		}

		if ( nextProps.meta !== undefined && ! isEqual( this.props.meta, nextProps.meta ) ) {
			this.props.setMeta( nextProps.meta );
		}

		if ( nextProps.formattedTitle !== this.props.formattedTitle ) {
			document.title = nextProps.formattedTitle;
		}
	}

	render() {
		return null;
	}
}

DocumentHead.propTypes = {
	title: PropTypes.string,
	unreadCount: PropTypes.number,
	link: PropTypes.array,
	meta: PropTypes.array,
	setTitle: PropTypes.func.isRequired,
	setLink: PropTypes.func.isRequired,
	setMeta: PropTypes.func.isRequired,
	setUnreadCount: PropTypes.func.isRequired
};

export default connect(
	state => ( {
		formattedTitle: getDocumentHeadFormattedTitle( state )
	} ),
	{
		setTitle,
		setLink,
		setMeta,
		setUnreadCount
	}
)( DocumentHead );
