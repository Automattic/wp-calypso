/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import SocialLogo from 'calypso/components/social-logo';
import services from './services';

/**
 * Style dependencies
 */
import './style.scss';

export default class ShareButton extends PureComponent {
	static propTypes = {
		service: PropTypes.string.isRequired,
		size: PropTypes.number,
		url: PropTypes.string,
		title: PropTypes.string,
		onClick: PropTypes.func,
		color: PropTypes.bool,
	};

	static defaultProps = {
		size: 48,
		defaultMessage: '',
		onClick: noop,
		color: true,
	};

	getUrl() {
		const template = services[ this.props.service ].url;
		const args = {
			URL: encodeURIComponent( this.props.url ),
			TITLE: encodeURIComponent( this.props.title ),
			SITE_SLUG: this.props.siteSlug,
		};

		return template.replace( /<([A-Z_]+)>/g, ( match, varName ) => args[ varName ] || '' );
	}

	handleClick = () => {
		if ( typeof window === 'undefined' ) {
			return;
		}

		const win = window.open(
			this.getUrl(),
			`share-button-window-${ this.props.service }`,
			services[ this.props.service ].windowArg || 'width=550,height=420,resizeable,scrollbars'
		);
		win.focus();

		this.props.onClick();
	};

	render() {
		const className = [ 'share-button', this.props.color && 'has-color' ]
			.filter( Boolean )
			.join( ' ' );

		if ( ! services[ this.props.service ] ) {
			return null;
		}

		return (
			<Button onClick={ this.handleClick } className={ className } borderless>
				<SocialLogo size={ this.props.size } icon={ this.props.service } />
			</Button>
		);
	}
}
