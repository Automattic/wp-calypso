/**
 * External dependencies.
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import each from 'lodash/each';

/**
 * Internal dependencies.
 */
import {
	setTitle,
	setDescription,
	addLink,
	addMeta,
	setUnreadCount
} from 'state/page/actions';

class Page extends Component {
	componentWillMount() {
		this.props.setTitle( this.props.title );
		this.props.setDescription( this.props.description );
		this.props.setUnreadCount( this.props.unreadCount );

		if ( this.props.link && this.props.link.length ) {
			each( this.props.link, ( link ) => {
				this.props.addLink( link );
			} );
		}

		if ( this.props.meta && this.props.meta.length ) {
			each( this.props.meta, ( meta ) => {
				this.props.addMeta( meta );
			} );
		}
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.title !== nextProps.title ) {
			this.props.setTitle( nextProps.title );
		}

		if ( this.props.description !== nextProps.description ) {
			this.props.setDescription( nextProps.description );
		}

		if ( this.props.unreadCount !== nextProps.unreadCount ) {
			this.props.setUnreadCount( nextProps.unreadCount );
		}

		if ( this.props.link !== nextProps.link && this.props.link.length ) {
			each( nextProps.link, ( link ) => {
				this.props.addLink( link );
			} );
		}

		if ( this.props.meta !== nextProps.meta && this.props.meta.length ) {
			each( nextProps.meta, ( meta ) => {
				this.props.addMeta( meta );
			} );
		}
	}

	render() {
		return null;
	}
}

Page.propTypes = {
	title: PropTypes.string,
	description: PropTypes.string,
	unreadCount: PropTypes.number,
	link: PropTypes.array,
	meta: PropTypes.array,

	setTitle: PropTypes.func.isRequired,
	setDescription: PropTypes.func.isRequired,
	addLink: PropTypes.func.isRequired,
	addMeta: PropTypes.func.isRequired,
	setUnreadCount: PropTypes.func.isRequired
};

Page.defaultProps = {
	title: '',
	unreadCount: 0,
	link: [],
	meta: [],
	description: ''
};

export default connect( null, {
	setTitle,
	setDescription,
	addLink,
	addMeta,
	setUnreadCount
} )( Page );
