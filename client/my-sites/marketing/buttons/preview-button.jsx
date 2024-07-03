import clsx from 'clsx';
import photon from 'photon';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import SocialLogo from 'calypso/components/social-logo';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import getCurrentRouteParameterized from 'calypso/state/selectors/get-current-route-parameterized';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

class SharingButtonsPreviewButton extends Component {
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
		const classes = clsx(
			'sharing-buttons-preview-button',
			'style-' + this.props.style,
			'share-' + this.props.button.ID,
			{
				'is-enabled': this.props.enabled,
				'is-custom': this.props.button.custom,
			}
		);

		return (
			<div
				className={ classes }
				onClick={ this.onClick }
				// eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
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
