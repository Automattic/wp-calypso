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
import { getGmailUrl, getGoogleAdminUrl } from 'calypso/lib/gsuite';
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

	const renderMailboxLink = () => {
		const { isSubscriptionActive, onClick, user } = props;

		if ( ! isSubscriptionActive ) {
			return;
		}

		return (
			<ExternalLink
				icon
				href={ getGmailUrl( user.email ) }
				onClick={ onClick }
				target="_blank"
				rel="noopener noreferrer"
				title={ translate( 'Go to Gmail to access your emails' ) }
			>
				Gmail
			</ExternalLink>
		);
	};

	const renderManageLink = () => {
		const { isSubscriptionActive, onClick, user } = props;

		if ( ! isSubscriptionActive || ! user.is_admin ) {
			return;
		}

		return (
			<ExternalLink
				icon
				className="gsuite-user-item__manage-link"
				href={ getGoogleAdminUrl( user.email ) }
				onClick={ onClick }
				target="_blank"
				rel="noopener noreferrer"
				title={ translate( 'Go to Google Admin to manage your G Suite account' ) }
			>
				Google Admin
			</ExternalLink>
		);
	};

	const renderFinishSetupButton = () => {
		const { isSubscriptionActive, siteSlug, user } = props;

		if ( ! user.is_admin || user.agreed_to_terms ) {
			return;
		}

		return (
			<Fragment>
				<Button compact={ true } onClick={ onFixClickHandler }>
					{ translate( 'Finish Setup' ) }
				</Button>

				{ siteSlug && (
					<PendingGSuiteTosNoticeDialog
						domainName={ user.domain }
						isSubscriptionActive={ isSubscriptionActive }
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

			<div className="gsuite-user-item__actions">
				{ renderFinishSetupButton() }

				{ renderManageLink() }

				{ renderMailboxLink() }
			</div>
		</li>
	);
}

GSuiteUserItem.propTypes = {
	isSubscriptionActive: PropTypes.bool.isRequired,
	onClick: PropTypes.func,
	siteSlug: PropTypes.string,
	user: PropTypes.object.isRequired,
};

export default GSuiteUserItem;
