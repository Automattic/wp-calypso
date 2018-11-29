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

class SubscriptionEdit extends Component {
	render() {
		const { attributes, className, isSelected, setAttributes } = this.props;
		const { subscribe_placeholder, show_subscribers_total, subscriber_count } = attributes;

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

		return (
			<div className={ className }>
				{ show_subscribers_total === true && (
					<p>
						{ subscriber_count } { 'subscribers' }
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
