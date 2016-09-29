/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import debugFactory from 'debug';
import debounce from 'lodash/debounce';

const debug = debugFactory( 'calypso:site-title-customization' );

class SiteTitleCustomization extends React.Component {
	constructor( props ) {
		super( props );
		this.updateDom = debounce( this.updateDom.bind( this ), 100 );
	}

	shouldComponentUpdate( nextProps ) {
		return this.props.customization !== nextProps.customization;
	}

	updateDom() {
		const { customization, dom } = this.props;
		debug( 'rendering with customization', customization );
		const blognameElement = dom.querySelector( '.site-title a' ) || {};
		const blogdescriptionElement = dom.querySelector( '.site-description' ) || {};
		blognameElement.innerHTML = customization.blogname;
		blogdescriptionElement.innerHTML = customization.blogdescription;
	}

	render() {
		if ( this.props.dom ) {
			this.updateDom();
		}
		return null;
	}
}

SiteTitleCustomization.propTypes = {
	dom: PropTypes.object,
	customization: PropTypes.object,
};

SiteTitleCustomization.defaultProps = {
	customization: {},
};

export default SiteTitleCustomization;
