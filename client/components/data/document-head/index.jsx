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
import {
	setDocumentHeadTitle as setTitle,
	setDocumentHeadDescription as setDescription,
	addDocumentHeadLink as addLink,
	addDocumentHeadMeta as addMeta,
	setDocumentHeadUnreadCount as setUnreadCount
} from 'state/document-head/actions';
import { getSelectedSiteId } from 'state/ui/selectors';

class DocumentHead extends Component {
	componentWillMount() {
		this.props.setTitle( this.props.title );
		this.props.setDescription( this.props.description );
		this.props.setUnreadCount( this.props.unreadCount );

		each( this.props.link, ( link ) => {
			this.props.addLink( link );
		} );

		each( this.props.meta, ( meta ) => {
			this.props.addMeta( meta );
		} );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.title !== nextProps.title ) {
			this.props.setTitle( nextProps.title );
		}

		// [TEMPORARY][TODO]: We should only check site ID so long as we need
		// maintain two separate title implementations. When titles are managed
		// exclusively through Redux state and title is updated in response to
		// change in site state, this can be removed.
		if ( this.props.siteId !== nextProps.siteId ) {
			this.props.setTitle( nextProps.title );
		}

		if ( this.props.description !== nextProps.description ) {
			this.props.setDescription( nextProps.description );
		}

		if ( this.props.unreadCount !== nextProps.unreadCount ) {
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
	}

	render() {
		return null;
	}
}

DocumentHead.propTypes = {
	title: PropTypes.string,
	description: PropTypes.string,
	unreadCount: PropTypes.number,
	link: PropTypes.array,
	meta: PropTypes.array,
	siteId: PropTypes.number,
	setTitle: PropTypes.func.isRequired,
	setDescription: PropTypes.func.isRequired,
	addLink: PropTypes.func.isRequired,
	addMeta: PropTypes.func.isRequired,
	setUnreadCount: PropTypes.func.isRequired
};

DocumentHead.defaultProps = {
	title: '',
	description: '',
	unreadCount: 0
};

export default connect(
	( state ) => {
		return {
			siteId: getSelectedSiteId( state )
		};
	},
	{
		setTitle,
		setDescription,
		addLink,
		addMeta,
		setUnreadCount
	}
)( DocumentHead );
