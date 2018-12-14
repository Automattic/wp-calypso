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
	state = {
		subscriberCountString: '',
	};

	componentDidMount() {
		// Get the subscriber count so it is available right away if the user toggles the setting
		this.get_subscriber_count();
	}

	render() {
		const { attributes, className, isSelected, setAttributes } = this.props;
		const { subscribePlaceholder, showSubscribersTotal } = attributes;

		if ( isSelected ) {
			return (
				<div className={ className } role="form">
					<ToggleControl
						label={ __( 'Show total subscribers' ) }
						checked={ showSubscribersTotal }
						onChange={ () => {
							setAttributes( { showSubscribersTotal: ! showSubscribersTotal } );
						} }
					/>
					<TextControl placeholder={ subscribePlaceholder } required onChange={ () => {} } />
					<Button type="button" isDefault>
						{ __( 'Subscribe' ) }
					</Button>
				</div>
			);
		}

		return (
			<div className={ className } role="form">
				{ showSubscribersTotal && <p role="heading">{ this.state.subscriberCountString }</p> }
				<TextControl placeholder={ subscribePlaceholder } />
				<Button type="button" isDefault>
					{ __( 'Subscribe' ) }
				</Button>
			</div>
		);
	}

	get_subscriber_count() {
		apiFetch( { path: '/wpcom/v2/subscribers/count' } ).then( count => {
			// Handle error condition
			if ( ! count.hasOwnProperty( 'count' ) ) {
				this.setState( {
					subscriberCountString: sprintf( __( 'Subscriber count unavailable' ) ),
				} );
			} else if ( 1 === count.count ) {
				this.setState( {
					subscriberCountString: sprintf( __( 'Join %s other subscriber' ), count.count ),
				} );
			} else {
				this.setState( {
					subscriberCountString: sprintf( __( 'Join %s other subscribers' ), count.count ),
				} );
			}
		} );
	}
}

export default SubscriptionEdit;
