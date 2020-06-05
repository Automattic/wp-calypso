/**
 * External dependencies
 */
import classNames from 'classnames';

/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */

const Edit = () => {
	const [ activeTab, setActiveTab ] = useState( 'one-time' );

	const isActive = ( button ) => ( activeTab === button ? 'active' : null );

	return (
		<>
			<div className="donations__container">
				<div className="donations__tabs">
					<button className={ isActive( 'one-time' ) } onClick={ () => setActiveTab( 'one-time' ) }>
						{ __( 'One-Time' ) }
					</button>
					<button className={ isActive( 'monthly' ) } onClick={ () => setActiveTab( 'monthly' ) }>
						{ __( 'Monthly' ) }
					</button>
					<button className={ isActive( 'annually' ) } onClick={ () => setActiveTab( 'annually' ) }>
						{ __( 'Annually' ) }
					</button>
				</div>
				<div
					id="donations__tab-one-time"
					className={ classNames( 'donations__tab', { active: isActive( 'one-time' ) } ) }
				>
					{ __( 'One-Time' ) }
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
		</>
	);
};

export default Edit;
