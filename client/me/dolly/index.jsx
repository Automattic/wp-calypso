import config from '@automattic/calypso-config';
import { CompactCard } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import ReauthRequired from 'calypso/me/reauth-required';
import SecuritySectionNav from 'calypso/me/security-section-nav';
import TelegramConnection from './telegram-connection';

import './style.scss';

class Dolly extends Component {
	static displayName = 'DollySecurity';

	static propTypes = {
		path: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	render() {
		const { path, translate } = this.props;
		const useCheckupMenu = config.isEnabled( 'security/security-checkup' );
		const title = translate( 'Telegram Agent' );

		return (
			<Main wideLayout className="security dolly">
				<PageViewTracker path="/me/security/ai-assistant" title="Me > AI Assistant" />
				<DocumentHead title={ title } />

				<NavigationHeader navigationItems={ [] } title={ translate( 'Security' ) } />

				{ ! useCheckupMenu && <SecuritySectionNav path={ path } /> }
				{ useCheckupMenu && (
					<HeaderCake backText={ translate( 'Back' ) } backHref="/me/security">
						{ title }
					</HeaderCake>
				) }

				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />

				<CompactCard className="dolly__description">
					{ translate(
						'Chat with our Telegram Agent to publish, update, and manage your WordPress site from wherever you are.'
					) }
				</CompactCard>

				{ config.isEnabled( 'dolly/telegram' ) && <TelegramConnection /> }
			</Main>
		);
	}
}

export default localize( Dolly );
