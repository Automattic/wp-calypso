/**
 * External dependencies
 */
import classNames from 'classnames';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { throttle } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import viewport from 'lib/viewport';

/**
 * Module variables
 */
const HIDE_BACK_CRITERIA = {
	windowWidth: 480,
	characterLength: 8
};

class HeaderCakeBack extends Component {
	static propTypes = {
		onClick: PropTypes.func,
		href: PropTypes.string,
		text: PropTypes.string,
		spacer: PropTypes.bool,
	};

	static defaultProps = {
		spacer: false,
		disabled: false,
	};

	state = {
		windowWidth: viewport.getWindowInnerWidth(),
	};

	componentDidMount() {
		this.resizeThrottled = throttle( this.handleWindowResize, 100 );
		window.addEventListener( 'resize', this.resizeThrottled );
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.resizeThrottled );
	}

	handleWindowResize = () => {
		this.setState( {
			windowWidth: viewport.getWindowInnerWidth(),
		} );
	}

	hideText( text ) {
		if (
			this.state.windowWidth <= HIDE_BACK_CRITERIA.windowWidth &&
			text.length >= HIDE_BACK_CRITERIA.characterLength ||
			this.state.windowWidth <= 300
		) {
			return true;
		}

		return false;
	}

	render() {
		const {
			href,
			icon,
			onClick,
			spacer,
			text,
			translate,
		} = this.props;
		const backText = text === undefined
			? translate( 'Back' )
			: text;
		const linkClasses = classNames( {
			'header-cake__back': true,
			'is-spacer': spacer,
			'is-action': !! icon
		} );

		return (
			<Button compact borderless className={ linkClasses } href={ href } onClick={ onClick } disabled={ spacer }>
				<Gridicon icon={ icon || 'arrow-left' } size={ 18 } />
				{ ! this.hideText( backText ) && backText }
			</Button>
		);
	}
}

export default localize( HeaderCakeBack );
