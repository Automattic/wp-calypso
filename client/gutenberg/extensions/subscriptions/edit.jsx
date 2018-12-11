/** @format */

/**
 * External dependencies
 */
import { Component, Fragment } from '@wordpress/element';
import { TextControl, Button, ToggleControl, Disabled } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import { sprintf } from '@wordpress/i18n/build/index';
import apiFetch from '@wordpress/api-fetch';
import {
	URLInput,
	RichText,
	ContrastChecker,
	InspectorControls,
	withColors,
	PanelColorSettings,
} from '@wordpress/editor';

class SubscriptionEdit extends Component {
	render() {
		const { attributes, className, isSelected, setAttributes } = this.props;
		const {
			subscribe_placeholder,
			show_subscribers_total,
			subscriber_count_string,
			button_background_color,
			button_text_color,
			button_large,
		} = attributes;

		const buttonStyle = {
			'background-color': button_background_color,
			color: button_text_color,
			border: 'none',
		};
		// Get the subscriber count so it is available right away if the user toggles the setting
		this.get_subscriber_count();

		if ( isSelected ) {
			return (
				<Fragment>
					<div className={ className } role="form">
						{ isSelected && <p role="heading">{ subscriber_count_string }</p> }
						<Disabled>
							<TextControl placeholder={ subscribe_placeholder } required onChange={ () => {} } />
						</Disabled>
						<Button isDefault isLarge={ button_large } onClick={ null } style={ buttonStyle }>
							{ __( 'Subscribe' ) }
						</Button>
					</div>
					<InspectorControls>
						<ToggleControl // Move this back to the block
							label={ __( 'Show total subscribers' ) }
							checked={ show_subscribers_total }
							onChange={ () => {
								setAttributes( { show_subscribers_total: ! show_subscribers_total } );
							} }
						/>
						<ToggleControl
							label={ __( 'Use a large button' ) }
							checked={ button_large }
							onChange={ () => {
								setAttributes( { button_large: ! button_large } );
							} }
						/>
						<PanelColorSettings
							title={ __( 'Button Color Settings' ) }
							colorSettings={ [
								{
									value: button_background_color,
									label: __( 'Background Color' ),
									onChange: console.log( 'foo' ), // How does this work?
								},
								{
									value: button_text_color,
									label: __( 'Text Color' ),
									onChange: console.log( 'bar' ), // How does this work?
								},
							] }
						/>
					</InspectorControls>
				</Fragment>
			);
		}

		return (
			<div className={ className } role="form">
				<p role="heading">{ subscriber_count_string }</p>
				<TextControl placeholder={ subscribe_placeholder } />
				<Button isLarge={ button_large } isDefault style={ buttonStyle }>
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
