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
		const { subscribe_placeholder, show_subscribers_total, subscriber_count_string } = attributes;

		// Get the subscriber count so it is available right away if the user toggles the setting
		this.get_subscriber_count();

		if ( isSelected ) {
			return (
				<div className={ className }>
					<ToggleControl
						label={ __( 'Show total subscribers' ) }
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

		return (
			<div className={ className }>
				{ show_subscribers_total && <p> { subscriber_count_string } </p> }
				<TextControl placeholder={ subscribe_placeholder } />
				<Button type="button" isDefault>
					{ __( 'Subscribe' ) }
				</Button>
			</div>
		);
	}

	get_subscriber_count() {
		const { setAttributes } = this.props;

		apiFetch( { path: '/wpcom/v2/subscribers/count' } ).then( count => {
			if ( 1 === count ) {
				setAttributes( {
					subscriber_count_string: sprintf( __( 'Join %s other subscriber' ), count.count ),
				} );
			} else {
				setAttributes( {
					subscriber_count_string: sprintf( __( 'Join %s other subscribers' ), count.count ),
				} );
			}
		} );
	}
}

export default SubscriptionEdit;
