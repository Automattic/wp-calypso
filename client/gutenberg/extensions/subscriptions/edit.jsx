/** @format */

/**
 * External dependencies
 */
import { Component, Fragment } from '@wordpress/element';
import { compose } from '@wordpress/compose';
import { Button, TextControl, ToggleControl, withFallbackStyles } from '@wordpress/components';
import { InspectorControls, PanelColorSettings, withColors } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import apiFetch from '@wordpress/api-fetch';
import { sprintf, _n } from '@wordpress/i18n';

const applyFallbackStyles = withFallbackStyles( ( node, ownProps ) => {
	const { textColor, backgroundColor } = ownProps;
	const backgroundColorValue = backgroundColor && backgroundColor.color;
	const textColorValue = textColor && textColor.color;
	//avoid the use of querySelector if textColor color is known and verify if node is available.
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
	state = {
		subscriberCountString: '',
	};

	componentDidMount() {
		// Get the subscriber count so it is available right away if the user toggles the setting
		this.get_subscriber_count();
	}

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
		} = this.props;
		const { subscribePlaceholder, showSubscribersTotal } = attributes;

		if ( isSelected ) {
			return (
				<Fragment>
					<div className={ className } role="form">
						<ToggleControl
							label={ __( 'Show total subscribers' ) }
							checked={ showSubscribersTotal }
							onChange={ () => {
								setAttributes( { showSubscribersTotal: ! showSubscribersTotal } );
							} }
						/>
						<TextControl
							placeholder={ subscribePlaceholder }
							disabled={ true }
							onChange={ () => {} }
						/>
						<Button type="button" isDefault>
							{ __( 'Subscribe' ) }
						</Button>
					</div>
					<InspectorControls>
						<PanelColorSettings
							title={ __( 'Button Color Settings' ) }
							colorSettings={ [
								{
									value: backgroundColor.color,
									onChange: setBackgroundColor,
									label: __( 'Background Color' ),
								},
								{
									value: textColor.color,
									onChange: setTextColor,
									label: __( 'Text Color' ),
								},
							] }
						/>
					</InspectorControls>
				</Fragment>
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
					subscriberCountString: __( 'Subscriber count unavailable' ),
				} );
			} else {
				this.setState( {
					subscriberCountString: sprintf(
						_n( 'Join %s other subscriber', 'Join %s other subscribers', count.count ),
						count.count
					),
				} );
			}
		} );
	}
}

export default compose( [
	withColors( 'backgroundColor', { textColor: 'color' } ),
	applyFallbackStyles,
] )( SubscriptionEdit );
