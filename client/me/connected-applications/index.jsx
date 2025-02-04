import config from '@automattic/calypso-config';
import { localize } from 'i18n-calypso';
import { times } from 'lodash';
import PropTypes from 'prop-types';
import { Fragment, PureComponent } from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryConnectedApplications from 'calypso/components/data/query-connected-applications';
import EmptyContent from 'calypso/components/empty-content';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import ConnectedAppItem from 'calypso/me/connected-application-item';
import ReauthRequired from 'calypso/me/reauth-required';
import SecuritySectionNav from 'calypso/me/security-section-nav';
import getConnectedApplications from 'calypso/state/selectors/get-connected-applications';
import getCurrentIntlCollator from 'calypso/state/selectors/get-current-intl-collator';

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
		const { apps, intlCollator } = this.props;

		if ( apps === null ) {
			return this.renderPlaceholders();
		}

		if ( ! apps.length ) {
			return this.renderEmptyContent();
		}

		// Sorts the list into alphabetical order then displays them.
		return apps
			.sort( ( a, b ) => {
				return intlCollator.compare( a.title, b.title );
			} )
			.map( ( connection ) => (
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
			<Main wideLayout className="security connected-applications">
				<QueryConnectedApplications />

				<PageViewTracker
					path="/me/security/connected-applications"
					title="Me > Connected Applications"
				/>
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />

				<NavigationHeader navigationItems={ [] } title={ translate( 'Security' ) } />

				<DocumentHead title={ translate( 'Connected Applications' ) } />

				{ this.renderConnectedAppsList() }
			</Main>
		);
	}
}

export default connect( ( state ) => ( {
	apps: getConnectedApplications( state ),
	intlCollator: getCurrentIntlCollator( state ),
} ) )( localize( ConnectedApplications ) );
