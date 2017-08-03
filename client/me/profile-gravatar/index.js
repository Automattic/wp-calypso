/**
 * External dependencies
 */
import React, { Component } from 'react';
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Animate from 'components/animate';
import Gravatar from 'components/gravatar';
import { recordGoogleEvent } from 'state/analytics/actions';
import { isEnabled } from 'config';
import ExternalLink from 'components/external-link';

const debug = debugFactory( 'calypso:me:sidebar-gravatar' );

class ProfileGravatar extends Component {
	componentDidMount() {
		debug( 'The ProfileGravatar component is mounted.' );
	}

	handleImageClick = () => {
		this.props.recordGoogleEvent( 'Me',
			'Clicked on Unclickable Gravatar Image in Sidebar'
		);
	};

	handleExternalLinkClick = () => {
		this.props.recordGoogleEvent( 'Me',
			'Clicked on Gravatar Update Profile Photo in Sidebar'
		);
	};

	render() {
		const profileURL = `https://gravatar.com/${ this.props.user.username }`;
		// use imgSize = 400 for caching
		// it's the popular value for large Gravatars in Calypso
		const GRAVATAR_IMG_SIZE = 400;

		if ( isEnabled( 'me/edit-gravatar' ) ) {
			return (
				<div className="profile-gravatar">
					<div className="profile-gravatar__gravatar-container" onClick={ this.handleImageClick }>
						<Gravatar user={ this.props.user } size={ 150 } imgSize={ GRAVATAR_IMG_SIZE } />
					</div>
					<h2 className="profile-gravatar__user-display-name">{ this.props.user.display_name }</h2>
					<div className="profile-gravatar__user-secondary-info">
						<ExternalLink
							href={ profileURL }
							target="_blank"
							rel="noopener noreferrer" >
							@{ this.props.user.username }
						</ExternalLink>
					</div>
				</div>
			);
		}

		return (
			<div className="profile-gravatar">
				<Animate type="appear">
					<ExternalLink
						href="https://secure.gravatar.com/site/wpcom?wpcc-no-close"
						target="_blank"
						rel="noopener noreferrer"
						className="profile-gravatar__edit"
						onClick={ this.handleExternalLinkClick } >

						<Gravatar user={ this.props.user } size={ 150 } imgSize={ GRAVATAR_IMG_SIZE } />

						<span className="profile-gravatar__edit-label-wrap">
							<span className="profile-gravatar__edit-label">
								{ this.props.translate( 'Update Profile Photo' ) }
							</span>
						</span>
					</ExternalLink>
				</Animate>
				<h2 className="profile-gravatar__user-display-name">{ this.props.user.display_name }</h2>
				<div className="profile-gravatar__user-secondary-info">
					<ExternalLink
						href={ profileURL }
						target="_blank"
						rel="noopener noreferrer" >
						@{ this.props.user.username }
					</ExternalLink>
				</div>
			</div>
		);
	}
}

export default connect( null, {
	recordGoogleEvent
} )( localize( ProfileGravatar ) );
