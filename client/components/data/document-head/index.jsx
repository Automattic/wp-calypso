import { debounce, isEqual } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import TranslatableString from 'calypso/components/translatable/proptype';
import {
	setDocumentHeadTitle as setTitle,
	setDocumentHeadLink as setLink,
	setDocumentHeadMeta as setMeta,
	setDocumentHeadUnreadCount as setUnreadCount,
} from 'calypso/state/document-head/actions';
import { getDocumentHeadFormattedTitle } from 'calypso/state/document-head/selectors/get-document-head-formatted-title';
import { getDocumentHeadTitle } from 'calypso/state/document-head/selectors/get-document-head-title';

class DocumentHead extends Component {
	componentDidMount() {
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

		this.setFormattedTitle( this.props.formattedTitle );
	}

	componentDidUpdate( prevProps ) {
		// The `title` prop is commonly receiving its value as a result from a `translate` call
		// and in some cases it returns a React component instead of string.
		// A shallow comparison of two React components may result in unnecessary title updates.
		// To avoid that, we compare the string representation of the passed `title` prop value.
		if (
			this.props.title !== undefined &&
			prevProps.title?.toString?.() !== this.props.title?.toString?.()
		) {
			this.props.setTitle( this.props.title );
		}

		if (
			this.props.unreadCount !== undefined &&
			prevProps.unreadCount !== this.props.unreadCount
		) {
			this.props.setUnreadCount( this.props.unreadCount );
		}

		if ( this.props.link !== undefined && ! isEqual( prevProps.link, this.props.link ) ) {
			this.props.setLink( this.props.link );
		}

		if ( this.props.meta !== undefined && ! isEqual( prevProps.meta, this.props.meta ) ) {
			this.props.setMeta( this.props.meta );
		}

		if ( this.props.formattedTitle !== prevProps.formattedTitle ) {
			this.setFormattedTitle( this.props.formattedTitle );
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
