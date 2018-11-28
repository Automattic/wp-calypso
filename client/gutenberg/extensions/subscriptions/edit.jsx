/** @format */

/**
 * External dependencies
 */
import { Component } from '@wordpress/element';
import { TextControl, FormToggle, Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import { sprintf } from '@wordpress/i18n/build/index';

class SubscriptionEdit extends Component {
	render() {
		const { attributes, className, isSelected, instanceId, setAttributes } = this.props;
		const {
			subscribe_placeholder,
			subscribe_button,
			success_message,
			show_subscribers_total,
		} = attributes;

		if ( isSelected ) {
			return (
				<div className={ className }>
					{ __( 'Show total subscribers' ) }
					<FormToggle
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

		/*
        let subscriberCount = null;
        if ( show_subscribers_total ) {
            if ( 1 === Jetpack_Initial_State.getModules.subscriptions.data.subscriber_count ) {
                subscriberCount = sprintf(
                    __( 'Join %s other subscriber' ),
                    Jetpack_Initial_State.getModules.subscriptions.data.subscriber_count
                );
            } else {
                subscriberCount = sprintf(
                    __( 'Join %s other subscribers' ),
                    Jetpack_Initial_State.getModules.subscriptions.data.subscriber_count
                );
            }
        }
        */
		const subscriberCount = 'Hi';

		return (
			<div className={ className }>
				{ show_subscribers_total === true && (
					<p>
						{ subscriberCount } { 'subscribers' }
					</p>
				) }
				<TextControl placeholder={ subscribe_placeholder } />
				<Button type="button" isDefault>
					{ __( 'Subscribe' ) }
				</Button>
			</div>
		);
	}
}

export default SubscriptionEdit;
