/**
 * External dependencies
 */
import { Component } from '@wordpress/element';
import { TextControl, ToggleControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { __ } from '../../utils/i18n';
import SubmitButton from '../../utils/submit-button';
import apiFetch from '@wordpress/api-fetch';
import { sprintf, _n } from '@wordpress/i18n';

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
					<TextControl
						placeholder={ subscribePlaceholder }
						disabled={ true }
						onChange={ () => {} }
					/>
					<SubmitButton { ...this.props } />
				</div>
			);
		}

		return (
			<div className={ className } role="form">
				{ showSubscribersTotal && <p role="heading">{ this.state.subscriberCountString }</p> }
				<TextControl placeholder={ subscribePlaceholder } />

				<SubmitButton { ...this.props } />
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

	onChangeSubmit( submitButtonText ) {
		this.props.setAttributes( { submitButtonText } );
	}
}

export default SubscriptionEdit;
