/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
const debug = debugFactory( 'calypso:me:security:social-login' );

/**
 * Internal dependencies
 */
import Card from 'components/card';
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import MeSidebarNavigation from 'me/sidebar-navigation';
import ReauthRequired from 'me/reauth-required';
import SecuritySectionNav from 'me/security-section-nav';
import twoStepAuthorization from 'lib/two-step-authorization';

class SocialLogin extends Component {
	static displayName = 'SocialLogin';

	static propTypes = {
		moment: PropTypes.func,
		path: PropTypes.string,
		translate: PropTypes.func.isRequired,
		userSettings: PropTypes.object,
	};

	componentDidMount() {
		debug( this.constructor.displayName + ' React component has mounted.' );
	}

	componentWillUnmount() {
		debug( this.constructor.displayName + ' React component is unmounting.' );
	}

	render() {
		const title = this.props.translate( 'Social Login', { textOnly: true } );

		return (
			<Main className="social-login">
				<DocumentHead title={ title } />
				<MeSidebarNavigation />

				<SecuritySectionNav path={ this.props.path } />

				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
				<Card>
					{ this.props.translate( 'Manage Social Login Connections' ) }
				</Card>
			</Main>
		);
	}
}

export default localize( SocialLogin );
