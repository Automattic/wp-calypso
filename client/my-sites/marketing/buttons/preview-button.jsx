/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import photon from 'photon';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'lib/analytics/tracks';
import { gaRecordEvent } from 'lib/analytics/ga';
import getCurrentRouteParameterized from 'state/selectors/get-current-route-parameterized';
import { getSelectedSiteId } from 'state/ui/selectors';
import SocialLogo from 'components/social-logo';

class SharingButtonsPreviewButton extends React.Component {
	static propTypes = {
		button: PropTypes.object.isRequired,
		style: PropTypes.oneOf( [ 'icon-text', 'icon', 'text', 'official' ] ),
		enabled: PropTypes.bool,
		onMouseOver: PropTypes.func,
		onClick: PropTypes.func,
		path: PropTypes.string,
	};

	static defaultProps = {
		style: 'icon',
		enabled: true,
		onClick: function () {},
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

	onClick = () => {
		recordTracksEvent( 'calypso_sharing_buttons_share_button_click', {
			service: this.props.button.ID,
			enabled: ! this.props.enabled, // during onClick enabled is the old state, so negating gives the new state
			path: this.props.path,
		} );
		gaRecordEvent( 'Sharing', 'Clicked Share Button', this.props.button.ID );
		this.props.onClick();
	};

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

export default connect(
	( state ) => ( {
		path: getCurrentRouteParameterized( state, getSelectedSiteId( state ) ),
	} ),
	null,
	null,
	{ forwardRef: true }
)( SharingButtonsPreviewButton );
