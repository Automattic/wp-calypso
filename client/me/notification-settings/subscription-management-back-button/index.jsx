import page from '@automattic/calypso-router';
import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import './style.scss';

class SubscriptionManagementBackButton extends Component {
	render() {
		return (
			page.current.includes( 'referrer=management' ) && (
				<Button
					className="subscription-management-back-button"
					onClick={ () => page( '/reader/subscriptions' ) }
					icon={ <Gridicon icon="chevron-left" size={ 12 } /> }
				>
					{ this.props.translate( 'Manage all subscriptions' ) }
				</Button>
			)
		);
	}
}

export default connect()( localize( SubscriptionManagementBackButton ) );
