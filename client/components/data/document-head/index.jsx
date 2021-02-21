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
import { getDocumentHeadTitle } from 'calypso/state/document-head/selectors/get-document-head-title';
import { getDocumentHeadFormattedTitle } from 'calypso/state/document-head/selectors/get-document-head-formatted-title';
import {
	setDocumentHeadTitle as setTitle,
	setDocumentHeadLink as setLink,
	setDocumentHeadMeta as setMeta,
	setDocumentHeadUnreadCount as setUnreadCount,
} from 'calypso/state/document-head/actions';
import TranslatableString from 'calypso/components/translatable/proptype';

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
		// The `title` prop is commonly receiving its value as a result from a `translate` call
		// and in some cases it returns a React component instead of string.
		// A shallow comparison of two React components may result in unnecessary title updates.
		// To avoid that, we compare the string representation of the passed `title` prop value.
		if (
			nextProps.title !== undefined &&
			this.props.title?.toString?.() !== nextProps.title?.toString?.()
		) {
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
	skipTitleFormatting: PropTypes.bool,
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
		formattedTitle: props.skipTitleFormatting
			? getDocumentHeadTitle( state )
			: getDocumentHeadFormattedTitle( state ),
	} ),
	{
		setTitle,
		setLink,
		setMeta,
		setUnreadCount,
	}
)( DocumentHead );
