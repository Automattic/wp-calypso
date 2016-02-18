/** @ssr-ready **/

/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import ObserveWindowSizeMixin from 'lib/mixins/observe-window-resize';
import Gridicon from 'components/gridicon';
import i18n from 'lib/mixins/i18n';
import viewport from 'lib/viewport';

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
		text: PropTypes.string,
		spacer: PropTypes.bool
	},

	getDefaultProps() {
		return {
			spacer: false
		};
	},

	render() {
		const { text = i18n.translate( 'Back' ), href, onClick, spacer } = this.props;
		const windowWidth = viewport.getWindowInnerWidth();
		const hideText = windowWidth <= HIDE_BACK_CRITERIA.windowWidth && text.length >= HIDE_BACK_CRITERIA.characterLength || windowWidth <= 300;
		const linkClasses = classNames( {
			'header-cake__back': true,
			'is-spacer': spacer
		} );

		return (
			<a className={ linkClasses } href={ href } onClick={ onClick }>
				<Gridicon icon="chevron-left" size={ 18 } />
				{ ! hideText && <span className="header-cake__back-text">{ text }</span> }
			</a>
		);
	},

	onWindowResize() {
		this.forceUpdate();
	}

} );
