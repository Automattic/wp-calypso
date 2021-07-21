/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import { Button } from '@automattic/components';

/**
 * Internal dependencies
 */
import FoldableCard from 'calypso/components/foldable-card';
import Gridicon from 'calypso/components/gridicon';
import { verifyEmail } from 'calypso/state/current-user/email-verification/actions';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';

import './index.scss';

interface Props {
	isEmailUnverified: boolean;
}

const ActionCenter: FunctionComponent< Props > = ( { isEmailUnverified } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const resendVerificationEmail = () => {
		dispatch( verifyEmail( { showGlobalNotices: true } ) );
	};

	return isEmailUnverified ? (
		<FoldableCard
			className="action-center"
			header={ translate( 'Action Center' ) }
			clickableHeader
			expanded={ true }
		>
			<div className="action-center__action">
				<Gridicon className="action-center__action-icon" icon="mail" />
				<div className="action-center__action-text">
					{ translate( 'Please verify your email' ) }
				</div>
				<Button
					onClick={ resendVerificationEmail }
					borderless
					compact
					className="action-center__action-link"
				>
					{ translate( 'send email' ) }
				</Button>
				<Button borderless compact className="action-center__action-dismiss-button">
					<Gridicon icon="cross-small" />
				</Button>
			</div>
		</FoldableCard>
	) : null;
};

export default connect( ( state ) => {
	return {
		isEmailUnverified: ! isCurrentUserEmailVerified( state ),
	};
} )( ActionCenter );
