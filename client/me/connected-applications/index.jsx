/**
 * External dependencies
 */
import React, { Fragment, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { times } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'calypso/config';
import ConnectedAppItem from 'calypso/me/connected-application-item';
import DocumentHead from 'calypso/components/data/document-head';
import EmptyContent from 'calypso/components/empty-content';
import getConnectedApplications from 'calypso/state/selectors/get-connected-applications';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import MeSidebarNavigation from 'calypso/me/sidebar-navigation';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import QueryConnectedApplications from 'calypso/components/data/query-connected-applications';
import ReauthRequired from 'calypso/me/reauth-required';
import SecuritySectionNav from 'calypso/me/security-section-nav';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';

/**
 * Style dependencies
 */
import './style.scss';

class ConnectedApplications extends PureComponent {
	static propTypes = {
		translate: PropTypes.func.isRequired,
	};

	renderEmptyContent() {
		const { translate } = this.props;

		return (
			<EmptyContent
				title={ translate( "You haven't connected any apps yet." ) }
				line={ translate( 'You can get started with the {{link}}WordPress mobile apps!{{/link}}', {
					components: {
						link: (
							<a
								href="https://apps.wordpress.org/"
								target="_blank"
								rel="noopener noreferrer"
								title="WordPress Mobile Apps"
							/>
						),
					},
				} ) }
			/>
		);
	}

	renderPlaceholders() {
		const { translate } = this.props;

		return times( 5, ( index ) => (
			<ConnectedAppItem
				connection={ {
					ID: index,
					title: translate( 'Loading Connected Applications' ),
				} }
				key={ index }
				isPlaceholder
			/>
		) );
	}

	renderConnectedApps() {
		const { apps } = this.props;

		if ( apps === null ) {
			return this.renderPlaceholders();
		}

		if ( ! apps.length ) {
			return this.renderEmptyContent();
		}

		return apps.map( ( connection ) => (
			<ConnectedAppItem connection={ connection } key={ connection.ID } />
		) );
	}

	renderConnectedAppsList() {
		const { path, translate } = this.props;
		const useCheckupMenu = config.isEnabled( 'security/security-checkup' );

		return (
			<Fragment>
				{ ! useCheckupMenu && <SecuritySectionNav path={ path } /> }
				{ useCheckupMenu && (
					<HeaderCake backText={ translate( 'Back' ) } backHref="/me/security">
						{ translate( 'Connected Applications' ) }
					</HeaderCake>
				) }

				{ this.renderConnectedApps() }
			</Fragment>
		);
	}

	render() {
		const { translate } = this.props;

		return (
			<Main className="security connected-applications">
				<QueryConnectedApplications />

				<PageViewTracker
					path="/me/security/connected-applications"
					title="Me > Connected Applications"
				/>
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
				<MeSidebarNavigation />

				<DocumentHead title={ translate( 'Connected Applications' ) } />

				{ this.renderConnectedAppsList() }
			</Main>
		);
	}
}

export default connect( ( state ) => ( {
	apps: getConnectedApplications( state ),
} ) )( localize( ConnectedApplications ) );
