/** @ssr-ready **/

/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ObserveWindowSizeMixin from 'lib/mixins/observe-window-resize';
import Gridicon from 'components/gridicon';
import Button from 'components/button';
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
			spacer: false,
			disabled: false
		};
	},

	hideText( text ) {
		const windowWidth = viewport.getWindowInnerWidth();

		if (
			windowWidth <= HIDE_BACK_CRITERIA.windowWidth &&
			text.length >= HIDE_BACK_CRITERIA.characterLength ||
			windowWidth <= 300
		) {
			return true;
		}

		return false;
	},

	render() {
		const { text = i18n.translate( 'Back' ), href, onClick, spacer } = this.props;
		const linkClasses = classNames( {
			'header-cake__back': true,
			'is-spacer': spacer
		} );

		return (
			<Button compact borderless className={ linkClasses } href={ href } onClick={ onClick } disabled={ spacer }>
				<Gridicon icon="arrow-left" size={ 18 } />
				{ ! this.hideText( text ) && text }
			</Button>
		);
	},

	onWindowResize() {
		this.forceUpdate();
	}

} );
