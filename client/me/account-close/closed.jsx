// TODO: Remove eslint-disable no-unused-vars once component is fully implemented
/* eslint-disable no-unused-vars */
import { Spinner } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import { BlankCanvas } from 'calypso/components/blank-canvas';
import FormattedHeader from 'calypso/components/formatted-header';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import isAccountClosed from 'calypso/state/selectors/is-account-closed';

import './closed.scss';

function AccountSettingsClosedComponent( { isUserAccountClosed } ) {
	const translate = useTranslate();

	const onClick = () => {
		window.location = '/';
	};

	// if ( ! isUserAccountClosed ) {
	// 	return (
	// 		<div className="account-close__spinner">
	// 			<Spinner size={ 32 } />
	// 			<p className="account-close__spinner-text">
	// 				{ translate( 'Your account is being deleted' ) }
	// 			</p>
	// 		</div>
	// 	);
	// }

	return (
		<BlankCanvas className="account-deleted">
			<BlankCanvas.Header>
				<Button variant="link" className="account-deleted__button-link">
					Create an account
				</Button>
			</BlankCanvas.Header>
			<BlankCanvas.Content>
				<FormattedHeader
					brandFont
					headerText={ translate( 'Your account has been deleted' ) }
					subHeaderText={ translate(
						'Thanks for flying with WordPress.com. You have 30 days to restore your account if you change your mind.'
					) }
				/>
				<div className="account-deleted__buttons">
					<Button variant="secondary" onClick={ onClick }>
						{ translate( 'Return to WordPress.com' ) }
					</Button>
					<Button variant="link" className="account-deleted__button-link">
						{ translate( 'I made a mistake! Restore my account' ) }
					</Button>
				</div>
			</BlankCanvas.Content>
		</BlankCanvas>
	);
}

export default connect( ( state ) => {
	return {
		previousRoute: getPreviousRoute( state ),
		isUserAccountClosed: isAccountClosed( state ),
	};
} )( AccountSettingsClosedComponent );
