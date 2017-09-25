/**
 * External dependencies
 */
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import twoStepAuthorization from 'lib/two-step-authorization';
import AccountPassword from 'me/account-password';
import ReauthRequired from 'me/reauth-required';
import SecuritySectionNav from 'me/security-section-nav';
import MeSidebarNavigation from 'me/sidebar-navigation';

const debug = debugFactory( 'calypso:me:security:password' );

class Security extends React.Component {
	static displayName = 'Security';

	static propTypes = {
		translate: PropTypes.func.isRequired,
	};

	componentDidMount() {
		debug( this.constructor.displayName + ' React component is mounted.' );
	}

	componentWillUnmount() {
		debug( this.constructor.displayName + ' React component is unmounting.' );
	}

	render() {
		const { translate } = this.props;

		return (
			<Main className="security">
				<DocumentHead title={ translate( 'Password', { textOnly: true } ) } />
				<MeSidebarNavigation />

				<SecuritySectionNav path={ this.props.path } />

				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
				<Card className="me-security-settings security__settings">
					<p>
						{ translate(
							'To update your password enter a new one below. Your password should be at least six characters long. ' +
							'To make it stronger, use upper and lower case letters, numbers and symbols like ! " ? $ % ^ & ).'
						) }
					</p>

					<AccountPassword
						userSettings={ this.props.userSettings }
						accountPasswordData={ this.props.accountPasswordData }
					/>
				</Card>
			</Main>
		);
	}
}

export default localize( Security );
