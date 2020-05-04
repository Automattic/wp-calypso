/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { debounce, isEqual } from 'lodash';

/**
 * Internal dependencies.
 */
import { getDocumentHeadFormattedTitle } from 'state/document-head/selectors';
import {
	setDocumentHeadTitle as setTitle,
	setDocumentHeadLink as setLink,
	setDocumentHeadMeta as setMeta,
	setDocumentHeadUnreadCount as setUnreadCount,
} from 'state/document-head/actions';
import TranslatableString from 'components/translatable/proptype';

class DocumentHead extends Component {
	UNSAFE_componentWillMount() {
		const { title, unreadCount } = this.props;

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
		this.setFormattedTitle( this.props.formattedTitle );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
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
			this.setFormattedTitle( nextProps.formattedTitle );
		}
	}

	componentWillUnmount() {
		this.setFormattedTitle.cancel();
	}

	setFormattedTitle = debounce( ( title ) => {
		document.title = title;
	} );

	render() {
		return null;
	}
}

DocumentHead.propTypes = {
	title: TranslatableString,
	formattedTitle: TranslatableString,
	unreadCount: PropTypes.number,
	link: PropTypes.array,
	meta: PropTypes.array,
	setTitle: PropTypes.func.isRequired,
	setLink: PropTypes.func.isRequired,
	setMeta: PropTypes.func.isRequired,
	setUnreadCount: PropTypes.func.isRequired,
};

export default connect(
	( state, props ) => ( {
		formattedTitle: props.formattedTitle || getDocumentHeadFormattedTitle( state ),
	} ),
	{
		setTitle,
		setLink,
		setMeta,
		setUnreadCount,
	}
)( DocumentHead );
