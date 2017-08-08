/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import {
	PRIMARY_DOMAIN_CHANGE_SUCCESS,
	PRIMARY_DOMAIN_CHANGE_FAIL,
	PRIMARY_DOMAIN_REVERT_FAIL,
	PRIMARY_DOMAIN_REVERT_SUCCESS
} from './constants';

const DomainListNotice = ( { type, domainName, errorMessage, onUndoClick, onDismissClick, translate } ) => {
	const props = {
		className: 'domain-management-list__notice',
		showDismiss: false,
		onDismissClick
	};

	switch ( type ) {
		case PRIMARY_DOMAIN_CHANGE_SUCCESS:
			Object.assign( props, {
				text: <span key="text">{ translate( 'Primary Domain changed: All domains will redirect to' +
					' {{em}}%(domainName)s{{/em}}.', { args: { domainName }, components: { em: <em /> } } ) }</span>,
				status: 'is-success',
				children: (
					<NoticeAction
						icon="refresh"
						key="undo-btn"
						onClick={ onUndoClick }>
						{ translate( 'Undo' ) }
					</NoticeAction>
				)
			} );
			break;
		case PRIMARY_DOMAIN_CHANGE_FAIL:
			Object.assign( props, {
				text: errorMessage || translate( 'Something went wrong and we couldn\'t change your Primary Domain.' ),
				status: 'is-error',
				showDismiss: true
			} );
			break;
		case PRIMARY_DOMAIN_REVERT_SUCCESS:
			Object.assign( props, {
				text: <span key="text">{ translate( 'No worries, your Primary Domain has been set back to' +
					' {{em}}%(domainName)s{{/em}}.', { args: { domainName }, components: { em: <em /> } } ) }</span>,
				status: 'is-success',
				showDismiss: true,
				duration: 10000
			} );
			break;
		case PRIMARY_DOMAIN_REVERT_FAIL:
			Object.assign( props, {
				text: <span>{ errorMessage || translate( 'Something went wrong and we couldn\'t revert the changes' ) }</span>,
				status: 'is-error',
				showDismiss: true
			} );
			break;
	}

	return (
		<Notice { ...props } />
	);
};

export default localize( DomainListNotice );
