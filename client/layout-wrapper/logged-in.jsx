/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import Layout from 'layout';
import nuxWelcome from 'layout/nux-welcome';
import translatorInvitation from 'layout/community-translator/invitation-utils';
import userFactory from 'lib/user';

const user = userFactory();

const LoggedInLayout = ( { primary, secondary } ) => <Layout
		primary={ primary }
		secondary={ secondary }
		user={ user }
		nuxWelcome={ nuxWelcome }
		translatorInvitation={ translatorInvitation }
	/>;

export default LoggedInLayout;
