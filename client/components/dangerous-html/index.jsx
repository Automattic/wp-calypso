/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import omit from 'lodash/object/omit';

export default React.createClass( {
	propTypes: {
		dangerousHtml: React.PropTypes.string.isRequired,
		tag: React.PropTypes.string,
	},

	getDefaultProps() {
		return {
			dangerousHtml: '',
			tag: 'div'
		}
	},

	componentDidMount() {
		this.updateHtml();
	},

	componentDidUpdate( prevProps ) {
		if ( prevProps.dangerousHtml !== this.props.dangerousHtml ) {
			this.updateHtml();
		}
	},

	updateHtml() {
		ReactDom.findDOMNode( this ).innerHTML = this.props.dangerousHtml;
	},

	render() {
		var tag = this.props.tag;
		return React.createElement( tag, omit( this.props, 'tag', 'dangerousHtml' ) );
	}
} );
