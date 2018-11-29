/** @format */

/**
 * External dependencies
 */
import { Component } from '@wordpress/element';
import { TextControl, Button, ToggleControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import { sprintf } from '@wordpress/i18n/build/index';
import apiFetch from '@wordpress/api-fetch';

class SubscriptionEdit extends Component {
	render() {
		const { attributes, className, isSelected, setAttributes } = this.props;
		const { subscribe_placeholder, show_subscribers_total } = attributes;

		if ( isSelected ) {
			return (
				<div className={ className }>
					<ToggleControl
						label={ 'Show total subscribers' }
						checked={ show_subscribers_total }
						onChange={ () => {
							setAttributes( { show_subscribers_total: ! show_subscribers_total } );
						} }
					/>
					<TextControl placeholder={ subscribe_placeholder } required onChange={ () => {} } />
					<Button type="button" isDefault>
						{ __( 'Subscribe' ) }
					</Button>
				</div>
			);
		}

		let subscriberCount = null;
		let subscriberCountString = null;

		if ( show_subscribers_total ) {
			apiFetch( { path: '/wpcom/v2/subscribers/count' } ).then( count => {
				subscriberCount = count;
			} );

			if ( 1 === subscriberCount ) {
				subscriberCountString = sprintf( __( 'Join %s other subscriber' ), subscriberCount );
			} else {
				subscriberCountString = sprintf( __( 'Join %s other subscribers' ), subscriberCount );
			}
		}
		return (
			<div className={ className }>
				<p>{ subscriberCountString }</p>
				<TextControl placeholder={ subscribe_placeholder } />
				<Button type="button" isDefault>
					{ __( 'Subscribe' ) }
				</Button>
			</div>
		);
	}
}

export default SubscriptionEdit;
