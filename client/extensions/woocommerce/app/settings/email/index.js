/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import MailChimp from './mailchimp';
import ActionHeader from 'woocommerce/components/action-header';
import SettingsNavigation from '../navigation';
import { getLink } from 'woocommerce/lib/nav-utils';

const Email = ( { site, siteId, translate, className } ) => {
	const breadcrumbs = [
		( <a href={ getLink( '/store/:site/', site ) }>{ translate( 'Settings' ) }</a> ),
		( <span>{ translate( 'Email' ) }</span> ),
	];

	return (
		<Main className={ classNames( 'email', className ) }>
			<ActionHeader breadcrumbs={ breadcrumbs }>
			</ActionHeader>
			<SettingsNavigation activeSection="email" />
			<MailChimp siteId={ siteId } />
		</Main>
	);
};

Email.propTypes = {
	className: PropTypes.string
};

export default localize( Email );
