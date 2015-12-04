/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import ObserveWindowSizeMixin from 'lib/mixins/observe-window-resize';
import Gridicon from 'components/gridicon';

/**
 * Module variables
 */
const HIDE_BACK_CRITERIA = {
	windowWidth: 480,
	characterLength: 8
};

export default React.createClass( {

	displayName: 'HeaderCakeBack',

	mixins: [ ObserveWindowSizeMixin ],

	propTypes: {
		onClick: PropTypes.func,
		href: PropTypes.string,
		text: PropTypes.string
	},

	getDefaultProps() {
		return {
			text: 'Back'
		}
	},

	render() {
		const { text, href, onClick } = this.props;
		const hideText = window.innerWidth <= HIDE_BACK_CRITERIA.windowWidth && text.length >= HIDE_BACK_CRITERIA.characterLength;

		return (
			<a className="header-cake__back" href={ href } onClick={ onClick }>
				<Gridicon icon="chevron-left" size={ 18 } />
				{ hideText ?
					null
				: <span className="header-cake__back-text">{ text }</span> }
			</a>
		);
	},

	onWindowResize() {
		this.forceUpdate();
	}

} );
