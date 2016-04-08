/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import WebPreview from 'components/web-preview';
import { getWindowInnerWidth } from 'lib/viewport';

const guessedSidebarWidth = () => {
	const winWidth = getWindowInnerWidth();
	if ( winWidth <= 660 ) return 0;
	if ( winWidth <= 960 ) return 229;
	return 273;
}

export default class GuidesPreview extends Component {
	constructor( props ) {
		super( props );
		this.state = { left: `${ guessedSidebarWidth() }px` };
		this.handleResize = this.handleResize.bind( this );
	}

	componentDidMount() {
		// TODO(mcsf): The sidebar adjusts _after_ a resize, so if a user's
		// resizing only generates one event the resizing performed here will
		// not be based on the latest dimensions of the sidebar. Is it worth
		// listening to DOM events on the sidebar?…
		global.window.addEventListener( 'resize', this.handleResize );
		global.window.addEventListener( 'load', this.handleResize );
		this.handleResize();
	}

	componentWillUnmount() {
		global.window.removeEventListener( 'resize', this.handleResize );
		global.window.removeEventListener( 'load', this.handleResize );
	}

	handleResize() {
		const base = global.window.document.querySelector( '#secondary .sidebar' );
		if ( ! base ) return;

		const { left, width } = base.getBoundingClientRect();
		this.setState( { left: `${ left + width }px` } );
	}

	render() {
		const {
			showPreview,
			selectedSite,
		} = this.props;

		const previewUrl = selectedSite
			? `${ selectedSite.URL }/?iframe=true&preview=true`
			: '';

		return <WebPreview className="guidestour-preview"
				style={ this.state }
				{ ...{ showPreview, previewUrl } } />;
	}
}
