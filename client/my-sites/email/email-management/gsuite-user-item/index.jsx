/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { useTranslate } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';

/**
 * Style dependencies
 */
import './style.scss';

function GSuiteUserItem( props ) {
	const translate = useTranslate();

	const getLoginLink = () => {
		const { email, domain } = props.user;
		return `https://accounts.google.com/AccountChooser?Email=${ email }&service=CPanel&continue=https://admin.google.com/a/${ domain }`;
	};

	return (
		<li>
			<span className="gsuite-user-item__email">{ props.user.email }</span>

			<ExternalLink
				icon
				className="gsuite-user-item__manage-link"
				href={ getLoginLink() }
				onClick={ props.onClick }
				target="_blank"
				rel="noopener noreferrer"
			>
				{ translate( 'Manage', { context: 'Login to G Suite Manage' } ) }
			</ExternalLink>
		</li>
	);
}

GSuiteUserItem.propTypes = {
	user: PropTypes.object.isRequired,
	onClick: PropTypes.func,
};

export default GSuiteUserItem;
