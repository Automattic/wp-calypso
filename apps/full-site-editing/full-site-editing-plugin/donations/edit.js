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

const Edit = () => {
	const [ activeTab, setActiveTab ] = useState( 'one-time' );

	const isActive = ( button ) => ( activeTab === button ? 'active' : null );

	return (
		<div className="donations__container">
			<Button className={ isActive( 'one-time' ) } onClick={ () => setActiveTab( 'one-time' ) }>
				{ __( 'One-Time' ) }
			</Button>
			<Button className={ isActive( 'monthly' ) } onClick={ () => setActiveTab( 'monthly' ) }>
				{ __( 'Monthly' ) }
			</Button>
			<Button className={ isActive( 'annually' ) } onClick={ () => setActiveTab( 'annually' ) }>
				{ __( 'Annually' ) }
			</Button>
			<div
				id="donations__tab-one-time"
				className={ classNames( 'donations__tab', { active: isActive( 'one-time' ) } ) }
			>
				{ __( 'One time' ) }
			</div>
			<div
				id="donations__tab-monthly"
				className={ classNames( 'donations__tab', { active: isActive( 'monthly' ) } ) }
			>
				{ __( 'Monthly' ) }
			</div>
			<div
				id="donations__tab-annually"
				className={ classNames( 'donations__tab', { active: isActive( 'annually' ) } ) }
			>
				{ __( 'Annually' ) }
			</div>
		</div>
	);
};

export default Edit;
