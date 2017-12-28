/** @format */

/**
 * External dependencies
 */

import debugFactory from 'debug';
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AccountPassword from 'client/me/account-password';
import Card from 'client/components/card';
import DocumentHead from 'client/components/data/document-head';
import Main from 'client/components/main';
import MeSidebarNavigation from 'client/me/sidebar-navigation';
import ReauthRequired from 'client/me/reauth-required';
import SecuritySectionNav from 'client/me/security-section-nav';
import twoStepAuthorization from 'client/lib/two-step-authorization';

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
