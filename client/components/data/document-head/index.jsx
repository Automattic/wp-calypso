/**
 * External dependencies.
 */
import PropTypes from 'prop-types';

import { Component } from 'react';
import { connect } from 'react-redux';
import { forEach, isEqual, map } from 'lodash';

/**
 * Internal dependencies.
 */
import {
	getDocumentHeadFormattedTitle,
	getDocumentHeadLink,
	getDocumentHeadMeta
} from 'state/document-head/selectors';
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

		this.refreshHeadTags();
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

		this.refreshHeadTags( nextProps );
	}

	refreshHeadTags( props = this.props ) {
		const { allLinks, allMeta } = props;

		allLinks.forEach( tagProperties => this.ensureTag( 'link', tagProperties ) );
		allMeta.forEach( tagProperties => this.ensureTag( 'meta', tagProperties ) );
	}

	ensureTag( tagName, properties ) {
		const propertiesSelector = map( properties, ( value, key ) => {
			if ( value !== undefined && typeof value === 'string' ) {
				const escapedValueInSelector = value.toString().replace( /([ #;?%&,.+*~\':"!^$[\]()=>|\/@])/g, '\\$1' );
				return `[${ key }="${ escapedValueInSelector }"]`;
			}
			return `[${ key }]`;
		} ).join( '' );
		const element = document.querySelector( `${ tagName }${ propertiesSelector }` );
		if ( ! element ) {
			const newTag = document.createElement( tagName );
			forEach( properties, ( value, key ) => {
				newTag[ key ] = value;
			} );
			const head = document.getElementsByTagName( 'head' )[ 0 ];
			head.appendChild( newTag );
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
		formattedTitle: getDocumentHeadFormattedTitle( state ),
		allLinks: getDocumentHeadLink( state ),
		allMeta: getDocumentHeadMeta( state ),
	} ),
	{
		setTitle,
		setLink,
		setMeta,
		setUnreadCount
	}
)( DocumentHead );
