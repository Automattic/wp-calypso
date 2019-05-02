/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import photon from 'photon';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import SocialLogo from 'components/social-logo';

export default class SharingButtonsPreviewButton extends React.Component {
	static propTypes = {
		button: PropTypes.object.isRequired,
		style: PropTypes.oneOf( [ 'icon-text', 'icon', 'text', 'official' ] ),
		enabled: PropTypes.bool,
		onMouseOver: PropTypes.func,
		onClick: PropTypes.func,
	};

	static defaultProps = {
		style: 'icon',
		enabled: true,
		onClick: function() {},
	};

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	getIcon() {
		const shortnameToSocialLogo = {
			email: 'mail',
			'google-plus-1': 'google-plus-alt',
			pinterest: 'pinterest-alt',
			tumblr: 'tumblr-alt',
			'jetpack-whatsapp': 'whatsapp',
			'press-this': 'wordpress',
			twitter: 'twitter-alt',
			more: 'share',
		};
		if ( ! this.props.button.custom ) {
			const icon = shortnameToSocialLogo[ this.props.button.ID ] || this.props.button.shortname;

			return <SocialLogo icon={ icon } size={ 18 } />;
		} else if ( 'string' === typeof this.props.button.icon ) {
			return (
				<span
					className="sharing-buttons-preview-button__custom-icon"
					style={ {
						backgroundImage: 'url(' + photon( this.props.button.icon, { width: 16 } ) + ')',
					} }
				/>
			);
		}
	}
	/* eslint-enable wpcalypso/jsx-classname-namespace */

	onClick() {
		analytics.ga.recordEvent( 'Sharing', 'Clicked Share Button', this.props.button.ID );
		this.props.onClick();
	}

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	render() {
		const classes = classNames(
			'sharing-buttons-preview-button',
			'style-' + this.props.style,
			'share-' + this.props.button.ID,
			{
				'is-enabled': this.props.enabled,
				'is-custom': this.props.button.custom,
			}
		);

		return (
			// eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
			<div
				className={ classes }
				onClick={ this.onClick }
				onMouseOver={ this.props.onMouseOver }
				role="presentation"
			>
				{ this.getIcon() }
				<span className="sharing-buttons-preview-button__service">{ this.props.button.name }</span>
			</div>
		);
	}
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}
