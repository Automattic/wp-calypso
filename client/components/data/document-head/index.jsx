/**
 * External dependencies.
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import each from 'lodash/each';
import isEqual from 'lodash/isEqual';

/**
 * Internal dependencies.
 */
import { getDocumentHeadFormattedTitle } from 'state/document-head/selectors';
import {
	setDocumentHeadTitle as setTitle,
	addDocumentHeadLink as addLink,
	addDocumentHeadMeta as addMeta,
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

		each( this.props.link, ( link ) => {
			this.props.addLink( link );
		} );

		each( this.props.meta, ( meta ) => {
			this.props.addMeta( meta );
		} );
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

		if ( ! isEqual( this.props.link, nextProps.link ) ) {
			each( nextProps.link, ( link ) => {
				this.props.addLink( link );
			} );
		}

		if ( ! isEqual( this.props.meta, nextProps.meta ) ) {
			each( nextProps.meta, ( meta ) => {
				this.props.addMeta( meta );
			} );
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
	addLink: PropTypes.func.isRequired,
	addMeta: PropTypes.func.isRequired,
	setUnreadCount: PropTypes.func.isRequired
};

export default connect(
	state => ( {
		formattedTitle: getDocumentHeadFormattedTitle( state )
	} ),
	{
		setTitle,
		addLink,
		addMeta,
		setUnreadCount
	}
)( DocumentHead );
