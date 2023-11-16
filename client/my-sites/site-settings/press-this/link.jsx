import { omit } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { newPost } from 'calypso/lib/paths';

/**
 * Retrieves selection, title, and URL from current page and pops
 * open new editor window with contents
 * @param  {string} postURL Editor URL for selected site
 */
const pressThis = function ( postURL ) {
	const doc = document;
	const win = window;
	const winGetSel = win.getSelection;
	const docGetSel = doc.getSelection;
	const docSel = doc.selection;
	const loc = doc.location;
	let sel;

	if ( winGetSel ) {
		sel = winGetSel();
	} else if ( docGetSel ) {
		sel = docGetSel();
	} else {
		sel = docSel ? docSel.createRange().text : '';
	}

	const url =
		postURL +
		'?url=' +
		encodeURIComponent( loc.href ) +
		'&title=' +
		encodeURIComponent( doc.title ) +
		'&text=' +
		encodeURIComponent( sel ) +
		'&v=5';

	const redirect = function () {
		if (
			! win.open( url, 't', 'toolbar=0,resizable=1,scrollbars=1,status=1,width=660,height=570' )
		) {
			loc.href = url;
		}
	};

	if ( /Firefox/.test( navigator.userAgent ) ) {
		setTimeout( redirect, 0 );
	} else {
		redirect();
	}
	void 0;
};

class PressThisLink extends Component {
	static propTypes = {
		site: PropTypes.object.isRequired,
	};

	/**
	 * generate press-this link pointing to current environment
	 * @returns {string} javascript pseudo-protocol link
	 */
	buildPressThisLink() {
		const functionText = pressThis.toString();
		const postDomain =
			typeof window !== 'undefined' ? window.location.origin : 'https://wordpress.com';
		const postURL = postDomain + newPost( this.props.site );
		return `javascript:( ${ functionText } )( '${ postURL }' )`;
	}

	render() {
		const omitProps = [ 'site' ];
		return (
			<a { ...omit( this.props, omitProps ) } href={ this.buildPressThisLink() }>
				{ this.props.children }
			</a>
		);
	}
}

export default PressThisLink;
