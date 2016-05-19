/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';

const GoogleAppsUserItem = React.createClass( {
	propTypes: {
		user: React.PropTypes.object.isRequired,
		onClick: React.PropTypes.func
	},

	shouldComponentUpdate( nextProps ) {
		return this.props.user !== nextProps.user || this.props.onClick !== nextProps.onClick;
	},

	render() {
		return (
			<li>
				<span className="google-apps-user-item__email">
					{ this.props.user.email }
				</span>

				<ExternalLink
					icon
					className="google-apps-user-item__manage-link"
					href={ `https://admin.google.com/a/${ this.props.user.domain }` }
					onClick={ this.props.onClick }
					target="_blank">
					{ this.translate( 'Manage', { context: 'Google Apps user item' } ) }
				</ExternalLink>
			</li>
		);
	}
} );

export default GoogleAppsUserItem;
