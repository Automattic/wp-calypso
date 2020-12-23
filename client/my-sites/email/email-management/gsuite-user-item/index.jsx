/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Fragment, useState } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Badge from 'calypso/components/badge';
import { Button } from '@automattic/components';
import ExternalLink from 'calypso/components/external-link';
import PendingGSuiteTosNoticeDialog from 'calypso/my-sites/domains/components/domain-warnings/pending-gsuite-tos-notice-dialog';

/**
 * Style dependencies
 */
import './style.scss';

function GSuiteUserItem( props ) {
	const translate = useTranslate();
	const [ dialogVisible, setDialogVisible ] = useState( false );

	const onFixClickHandler = ( event ) => {
		event.preventDefault();

		setDialogVisible( true );
	};

	const onCloseClickHandler = () => {
		setDialogVisible( false );
	};

	const getLoginLink = () => {
		const { email, domain } = props.user;

		return `https://accounts.google.com/AccountChooser?Email=${ email }&service=CPanel&continue=https://admin.google.com/a/${ domain }`;
	};

	const renderBadge = () => {
		if ( ! props.user.is_admin ) {
			return;
		}

		return (
			<Badge type="info">
				{ translate( 'Admin', { context: 'Noun: A user role displayed in a badge' } ) }
			</Badge>
		);
	};

	const renderManageLink = () => {
		return (
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
		);
	};

	const renderFinishSetupButton = () => {
		const { siteSlug, user } = props;

		return (
			<Fragment>
				<Button compact onClick={ onFixClickHandler }>
					{ translate( 'Finish Setup' ) }
				</Button>

				{ siteSlug && (
					<PendingGSuiteTosNoticeDialog
						domainName={ user.domain }
						onClose={ onCloseClickHandler }
						section={ 'gsuite-users-manage-user' }
						siteSlug={ siteSlug }
						user={ user.email }
						visible={ dialogVisible }
					/>
				) }
			</Fragment>
		);
	};

	return (
		<li>
			<div className="gsuite-user-item__email">
				<strong>{ props.user.email }</strong>

				{ renderBadge() }
			</div>

			{ props.user.agreed_to_terms ? renderManageLink() : renderFinishSetupButton() }
		</li>
	);
}

GSuiteUserItem.propTypes = {
	onClick: PropTypes.func,
	siteSlug: PropTypes.string,
	user: PropTypes.object.isRequired,
};

export default GSuiteUserItem;
