import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import QueryConnectedApplications from 'calypso/components/data/query-connected-applications';
import getConnectedApplications from 'calypso/state/selectors/get-connected-applications';
import SecurityCheckupNavigationItem from './navigation-item';

class SecurityCheckupConnectedApplications extends Component {
	static propTypes = {
		connectedApps: PropTypes.array,
		translate: PropTypes.func.isRequired,
	};

	renderConnectedApplications() {
		const { connectedApps, translate } = this.props;
		let connectedAppsDescription;

		if ( ! connectedApps.length ) {
			connectedAppsDescription = translate( 'You do not have any connected applications.' );
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
		}

		return (
			<SecurityCheckupNavigationItem
				path="/me/security/connected-applications"
				materialIcon="power"
				materialIconStyle="filled"
				text={ translate( 'Connected Apps' ) }
				description={ connectedAppsDescription }
			/>
		);
	}

	render() {
		const { connectedApps } = this.props;
		let content;
		if ( connectedApps === null ) {
			content = <SecurityCheckupNavigationItem isPlaceholder />;
		} else {
			content = this.renderConnectedApplications();
		}

		return (
			<Fragment>
				<QueryConnectedApplications />
				{ content }
			</Fragment>
		);
	}
}

export default connect( ( state ) => ( {
	connectedApps: getConnectedApplications( state ),
} ) )( localize( SecurityCheckupConnectedApplications ) );
