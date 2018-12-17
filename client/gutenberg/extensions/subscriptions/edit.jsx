/** @format */

/**
 * External dependencies
 */
import { Component, Fragment } from '@wordpress/element';
import {
	TextControl,
	Button,
	ToggleControl,
	Disabled,
	withFallbackStyles,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import { sprintf } from '@wordpress/i18n/build/index';
import apiFetch from '@wordpress/api-fetch';
import { compose } from '@wordpress/compose';
import {
	ContrastChecker,
	InspectorControls,
	withColors,
	PanelColorSettings,
} from '@wordpress/editor';

const { getComputedStyle } = window;

const applyFallbackStyles = withFallbackStyles( ( node, ownProps ) => {
	const { textColor, backgroundColor } = ownProps;
	const backgroundColorValue = backgroundColor && backgroundColor.color;
	const textColorValue = textColor && textColor.color;
	// //avoid the use of querySelector if textColor color is known and verify if node is available.
	const textNode =
		! textColorValue && node ? node.querySelector( '[contenteditable="true"]' ) : null;
	return {
		fallbackBackgroundColor:
			backgroundColorValue || ! node ? undefined : getComputedStyle( node ).backgroundColor,
		fallbackTextColor:
			textColorValue || ! textNode ? undefined : getComputedStyle( textNode ).color,
	};
} );

class SubscriptionEdit extends Component {
	render() {
		const {
			attributes,
			className,
			isSelected,
			setAttributes,
			backgroundColor,
			textColor,
			setBackgroundColor,
			setTextColor,
			fallbackBackgroundColor,
			fallbackTextColor,
		} = this.props;
		const {
			subscribe_placeholder,
			show_subscribers_total,
			subscriber_count_string,
			button_background_color,
			button_text_color,
			button_large,
		} = attributes;

		const buttonStyle = {
			backgroundColor: backgroundColor.color,
			color: textColor.color,
			border: 'none',
		};
		// Get the subscriber count so it is available right away if the user toggles the setting
		this.get_subscriber_count();

		if ( isSelected ) {
			return (
				<Fragment>
					<div className={ className } role="form">
						<ToggleControl // Move this back to the block
							label={ __( 'Show total subscribers' ) }
							checked={ show_subscribers_total }
							onChange={ () => {
								setAttributes( { show_subscribers_total: ! show_subscribers_total } );
							} }
						/>
						<Disabled>
							<TextControl placeholder={ subscribe_placeholder } required onChange={ () => {} } />
						</Disabled>
						<Button isDefault isLarge={ button_large } onClick={ null } style={ buttonStyle }>
							{ __( 'Subscribe' ) }
						</Button>
					</div>
					<InspectorControls>
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
									value: backgroundColor.color,
									label: __( 'Background Color' ),
									onChange: setBackgroundColor,
								},
								{
									value: textColor.color,
									label: __( 'Text Color' ),
									onChange: setTextColor,
								},
							] }
						/>
						<ContrastChecker
							{ ...{
								// Text is considered large if font size is greater or equal to 18pt or 24px,
								// currently that's not the case for button.
								isLargeText: false,
								textColor: textColor.color,
								backgroundColor: backgroundColor.color,
								fallbackBackgroundColor,
								fallbackTextColor,
							} }
						/>
					</InspectorControls>
				</Fragment>
			);
		}

		if ( show_subscribers_total === true ) {
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

		return (
			<div className={ className } role="form">
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

export default compose( [
	withColors( 'backgroundColor', { textColor: 'color' } ),
	applyFallbackStyles,
] )( SubscriptionEdit );
