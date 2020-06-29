/**
 * External dependencies
 */
import classNames from 'classnames';

/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import StripeNudge from './stripe-nudge';

const Donations = ( { products, stripeConnectUrl } ) => {
	const [ activeTab, setActiveTab ] = useState( 'one-time' );

	const isActive = ( button ) => ( activeTab === button ? 'active' : null );

	return (
		<div className="donations__container">
			{ stripeConnectUrl && <StripeNudge stripeConnectUrl={ stripeConnectUrl } /> }
			<div className="donations__tabs">
				<Button className={ isActive( 'one-time' ) } onClick={ () => setActiveTab( 'one-time' ) }>
					{ __( 'One-Time', 'full-site-editing' ) }
				</Button>
				<Button className={ isActive( 'monthly' ) } onClick={ () => setActiveTab( 'monthly' ) }>
					{ __( 'Monthly', 'full-site-editing' ) }
				</Button>
				<Button className={ isActive( 'annually' ) } onClick={ () => setActiveTab( 'annually' ) }>
					{ __( 'Annually', 'full-site-editing' ) }
				</Button>
				<div
					id="donations__tab-one-time"
					className={ classNames( 'donations__tab', { active: isActive( 'one-time' ) } ) }
				>
					{ __( 'One time', 'full-site-editing' ) }
				</div>
				<div
					id="donations__tab-monthly"
					className={ classNames( 'donations__tab', { active: isActive( 'monthly' ) } ) }
				>
					{ __( 'Monthly', 'full-site-editing' ) }
				</div>
				<div
					id="donations__tab-annually"
					className={ classNames( 'donations__tab', { active: isActive( 'annually' ) } ) }
				>
					{ __( 'Annually', 'full-site-editing' ) }
				</div>
			</div>
		</div>
	);
};

export default Donations;
