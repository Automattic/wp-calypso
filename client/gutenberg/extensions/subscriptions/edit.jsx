/** @format */

/**
 * External dependencies
 */
import { Component } from '@wordpress/element';
import { TextControl, FormToggle } from '@wordpress/components';

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
					<input type="button" disabled value={ __( 'Subscribe' ) } />
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
				{ subscriberCount }
				<TextControl
					aria-describedby={ `${ instanceId }-email-help` }
					placeholder={ subscribe_placeholder }
				/>
				<input type="button" value={ __( 'Subscribe' ) } />
			</div>
		);
	}
}

export default SubscriptionEdit;
