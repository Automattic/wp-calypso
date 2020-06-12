/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import getConnectedApplications from 'state/selectors/get-connected-applications';
import { getOKIcon, getWarningIcon } from './icons.js';
import QueryConnectedApplications from 'components/data/query-connected-applications';
import SecurityCheckupNavigationItem from './navigation-item';

class SecurityCheckupConnectedApplications extends React.Component {
	static propTypes = {
		connectedApps: PropTypes.array,
		translate: PropTypes.func.isRequired,
	};

	renderConnectedApplications() {
		const { connectedApps, translate } = this.props;
		let connectedAppsDescription, icon;

		if ( ! connectedApps.length ) {
			connectedAppsDescription = translate( 'You do not have any connected applications.' );
			icon = getOKIcon();
		} else {
			connectedAppsDescription = translate(
				'You currently have %(numberOfApps)d connected application.',
				'You currently have %(numberOfApps)d connected applications.',
				{
					count: connectedApps.length,
					args: {
						numberOfApps: connectedApps.length,
					},
				}
			);
			icon = getWarningIcon();
		}

		return (
			<SecurityCheckupNavigationItem
				path={ '/me/security/connected-applications' }
				materialIcon={ icon }
				text={ translate( 'Connected Apps' ) }
				description={ connectedAppsDescription }
			/>
		);
	}

	render() {
		const { connectedApps } = this.props;
		let content;
		if ( connectedApps === null ) {
			content = <SecurityCheckupNavigationItem isPlaceholder={ true } />;
		} else {
			content = this.renderConnectedApplications();
		}

		return (
			<React.Fragment>
				<QueryConnectedApplications />
				{ content }
			</React.Fragment>
		);
	}
}

export default connect( ( state ) => ( {
	connectedApps: getConnectedApplications( state ),
} ) )( localize( SecurityCheckupConnectedApplications ) );
