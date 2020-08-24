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

function GSuiteUserItem( props ) {
	const translate = useTranslate();
	const [ dialogVisible, setDialogVisible ] = useState( false );
	const onFixClickHandler = ( e ) => {
		e.preventDefault();
		setDialogVisible( true );
	};
	const onCloseClickHandler = () => {
		setDialogVisible( false );
	};

	const getLoginLink = () => {
		const { email, domain } = props.user;
		return `https://accounts.google.com/AccountChooser?Email=${ email }&service=CPanel&continue=https://admin.google.com/a/${ domain }`;
	};

	const renderManage = () => {
		return (
			<ExternalLink
				icon
				className="gsuite-user-item"
				href={ getLoginLink() }
				onClick={ props.onClick }
				target="_blank"
				rel="noopener noreferrer"
			>
				{ translate( 'Manage', { context: 'Login to G Suite Manage' } ) }
			</ExternalLink>
		);
	};

	const renderFix = () => {
		return (
			<Fragment>
				<Button className="gsuite-user-item__fix" compact={ true } onClick={ onFixClickHandler }>
					{ translate( 'Finish Setup' ) }
				</Button>
				{ props.siteSlug && (
					<PendingGSuiteTosNoticeDialog
						domainName={ props.user.domain }
						onClose={ onCloseClickHandler }
						section={ 'gsuite-users-manage-user' }
						siteSlug={ props.siteSlug }
						user={ props.user.email }
						visible={ dialogVisible }
					/>
				) }
			</Fragment>
		);
	};

	return (
		<li>
			<span className="gsuite-user-item__email">{ props.user.email }</span>
			{ props.user.agreed_to_terms ? renderManage() : renderFix() }
		</li>
	);
}

GSuiteUserItem.propTypes = {
	user: PropTypes.object.isRequired,
	onClick: PropTypes.func,
};

export default GSuiteUserItem;
