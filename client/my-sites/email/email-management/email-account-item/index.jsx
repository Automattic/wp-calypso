/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Fragment, useState } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import ExternalLink from 'components/external-link';
import PendingGSuiteTosNoticeDialog from 'my-sites/domains/components/domain-warnings/pending-gsuite-tos-notice-dialog';

/**
 * Style dependencies
 */
import './style.scss';

function EmailAccountItem( props ) {
	const translate = useTranslate();
	const [ dialogVisible, setDialogVisible ] = useState( false );
	const onFixClickHandler = ( e ) => {
		e.preventDefault();
		setDialogVisible( true );
	};
	const onCloseClickHandler = () => {
		setDialogVisible( false );
	};

	const {
		account: { domainName },
		mailbox: { name, meta = {} },
		onClick,
		siteSlug,
	} = props;
	const email = `${ name }@${ domainName }`;

	const renderManage = () => {
		return (
			<ExternalLink
				icon
				className="email-account-item"
				href={ meta.loginLink }
				onClick={ onClick }
				target="_blank"
				rel="noopener noreferrer"
			>
				{ translate( 'Manage' ) }
			</ExternalLink>
		);
	};

	const renderFix = () => {
		return (
			<Fragment>
				<Button className="email-account-item__fix" compact={ true } onClick={ onFixClickHandler }>
					{ translate( 'Finish Setup' ) }
				</Button>
				{ siteSlug && (
					<PendingGSuiteTosNoticeDialog
						domainName={ domainName }
						onClose={ onCloseClickHandler }
						section={ 'gsuite-users-manage-user' }
						siteSlug={ siteSlug }
						user={ email }
						visible={ dialogVisible }
					/>
				) }
			</Fragment>
		);
	};

	return (
		<li>
			<span className="email-account-item__email">{ email }</span>
			{ meta.needsFixing ? renderFix() : renderManage() }
		</li>
	);
}

EmailAccountItem.propTypes = {
	mailbox: PropTypes.object.isRequired,
	account: PropTypes.object.isRequired,
	onClick: PropTypes.func,
};

export default EmailAccountItem;
