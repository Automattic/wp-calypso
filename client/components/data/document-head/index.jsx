import { debounce, isEqual } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import TranslatableString from 'calypso/components/translatable/proptype';
import { isGravPoweredOAuth2Client, isGravatarFlowOAuth2Client } from 'calypso/lib/oauth2-clients';
import {
	setDocumentHeadTitle as setTitle,
	setDocumentHeadLink as setLink,
	setDocumentHeadMeta as setMeta,
	setDocumentHeadUnreadCount as setUnreadCount,
} from 'calypso/state/document-head/actions';
import { getDocumentHeadFormattedTitle } from 'calypso/state/document-head/selectors/get-document-head-formatted-title';
import { getDocumentHeadTitle } from 'calypso/state/document-head/selectors/get-document-head-title';
import { gravatarClientData } from 'calypso/state/oauth2-clients/reducer';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';

const isServer = typeof document === 'undefined';

class DocumentHead extends Component {
	constructor( props ) {
		super( props );
		// In SSR, sync the state in constructor, in browser do it in effects.
		if ( isServer ) {
			this.syncState();
		}
	}

	componentDidMount() {
		this.syncState();
		this.setFormattedTitle();
	}

	componentDidUpdate( prevProps ) {
		this.syncState( prevProps );

		if ( this.props.formattedTitle !== prevProps.formattedTitle ) {
			this.setFormattedTitle();
		}
	}

	componentWillUnmount() {
		this.setFormattedTitle.cancel();
	}

	syncState( prevProps = null ) {
		const { title, unreadCount, link, meta } = this.props;
		// The `title` prop is commonly receiving its value as a result from a `translate` call
		// and in some cases it returns a React component instead of string.
		// A shallow comparison of two React components may result in unnecessary title updates.
		// To avoid that, we compare the string representation of the passed `title` prop value.
		if (
			title !== undefined &&
			! ( prevProps && prevProps.title?.toString?.() === title?.toString?.() )
		) {
			this.props.setTitle( title );
		}

		if ( unreadCount !== undefined && ! ( prevProps && prevProps.unreadCount === unreadCount ) ) {
			this.props.setUnreadCount( unreadCount );
		}

		if ( link !== undefined && ! ( prevProps && isEqual( prevProps.link, link ) ) ) {
			this.props.setLink( link );
		}

		if ( meta !== undefined && ! ( prevProps && isEqual( prevProps.meta, meta ) ) ) {
			this.props.setMeta( meta );
		}
	}

	setFormattedTitle = debounce( () => {
		document.title = this.props.formattedTitle;
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
	( state, props ) => {
		const oauth2Client = getCurrentOAuth2Client( state );
		let formattedTitle = props.skipTitleFormatting
			? getDocumentHeadTitle( state )
			: getDocumentHeadFormattedTitle( state );

		if ( isGravPoweredOAuth2Client( oauth2Client ) ) {
			// Use Gravatar's title for the Gravatar-related OAuth2 clients in CSR.
			formattedTitle = isGravatarFlowOAuth2Client( oauth2Client )
				? gravatarClientData.title
				: oauth2Client.title;
		}

		return { formattedTitle };
	},
	{
		setTitle,
		setLink,
		setMeta,
		setUnreadCount,
	}
)( DocumentHead );
