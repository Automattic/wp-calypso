/**
 * External dependencies
 */
import { getWindowInnerWidth } from '@automattic/viewport';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import Gridicon from 'calypso/components/gridicon';
import { throttle } from 'lodash';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Module variables
 */
const HIDE_BACK_CRITERIA = {
	windowWidth: 480,
	characterLength: 8,
};

class HeaderCakeBack extends Component {
	static propTypes = {
		onClick: PropTypes.func,
		href: PropTypes.string,
		text: PropTypes.string,
		spacer: PropTypes.bool,
		alwaysShowActionText: PropTypes.bool,
	};

	static defaultProps = {
		spacer: false,
		disabled: false,
		alwaysShowActionText: false,
	};

	state = {
		windowWidth: getWindowInnerWidth(),
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
			windowWidth: getWindowInnerWidth(),
		} );
	};

	hideText( text ) {
		if (
			! this.props.alwaysShowActionText &&
			( ( this.state.windowWidth <= HIDE_BACK_CRITERIA.windowWidth &&
				text.length >= HIDE_BACK_CRITERIA.characterLength ) ||
				this.state.windowWidth <= 300 )
		) {
			return true;
		}

		return false;
	}

	render() {
		const { href, icon, onClick, spacer, text, translate } = this.props;
		const backText = text === undefined ? translate( 'Back' ) : text;
		const linkClasses = classNames( {
			'header-cake__back': true,
			'is-spacer': spacer,
			'is-action': !! icon,
		} );

		return (
			<Button
				compact
				borderless
				className={ linkClasses }
				href={ href }
				onClick={ onClick }
				disabled={ spacer }
			>
				<Gridicon icon={ icon || 'arrow-left' } size={ 18 } />
				{ ! this.hideText( backText ) && backText }
			</Button>
		);
	}
}

export default localize( HeaderCakeBack );
