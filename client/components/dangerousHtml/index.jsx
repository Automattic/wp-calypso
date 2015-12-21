/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import omit from 'lodash/object/omit';

export default React.createClass( {
	propTypes: {
		html: React.PropTypes.string.isRequired,
		tag: React.PropTypes.string,
	},

	getDefaultProps() {
		return {
			tag: 'div'
		}
	},

	componentDidMount() {
		ReactDom.findDOMNode( this ).innerHTML = this.props.html;
	},

	componentDidUpdate( prevProps ) {
		if ( prevProps.html !== this.props.html ) {
			this.componentDidMount();
		}
	},

	render() {
		var tag = this.props.tag;
		return React.createElement( tag, omit( this.props, 'tag', 'html' ) );
	}
} );
