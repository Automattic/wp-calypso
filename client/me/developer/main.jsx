import { localize } from 'i18n-calypso';
import { Component } from 'react';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import ReauthRequired from 'calypso/me/reauth-required';
import { DeveloperFeatures } from './features/index';

import './style.scss';

class Developer extends Component {
	render() {
		return (
			<Main className="developer" wideLayout>
				<PageViewTracker path="/me/developer" title="Me > Developer" />
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
				<NavigationHeader
					navigationItems={ [] }
					title={ this.props.translate( 'Developer Features' ) }
					subtitle={ this.props.translate(
						'Take WordPress.com further with early access to new developer features.'
					) }
					className="developer__header"
				/>

				<DeveloperFeatures />
			</Main>
		);
	}
}

export default localize( Developer );
