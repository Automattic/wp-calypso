import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import EmptyContent from 'calypso/components/empty-content';
import Spinner from 'calypso/components/spinner';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import isAccountClosed from 'calypso/state/selectors/is-account-closed';

import './closed.scss';

class AccountSettingsClosedComponent extends Component {
	onClick = () => {
		window.location = '/';
	};

	render() {
		const { isUserAccountClosed, translate } = this.props;

		if ( ! isUserAccountClosed ) {
			return (
				<div className="account-close__spinner">
					<Spinner size={ 32 } />
					<p className="account-close__spinner-text">
						{ translate( 'Your account is being deleted' ) }
					</p>
				</div>
			);
		}

		return (
			<EmptyContent
				title={ translate( 'Your account has been closed' ) }
				line={ translate( 'Thanks for flying with WordPress.com' ) }
				secondaryAction={ translate( 'Return to WordPress.com' ) }
				secondaryActionCallback={ this.onClick }
			/>
		);
	}
}

export default connect( ( state ) => {
	return {
		previousRoute: getPreviousRoute( state ),
		isUserAccountClosed: isAccountClosed( state ),
	};
} )( localize( AccountSettingsClosedComponent ) );
