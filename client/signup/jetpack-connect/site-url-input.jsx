/**
 * External dependencies
 */
import React, { Component } from 'react';
import i18n from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import Spinner from 'components/spinner';
import untrailingslashit from 'lib/route/untrailingslashit';


class JetpackConnectSiteURLInput extends Component {
	constructor() {
		super();
		this.onChange = this.onChange.bind( this );
		this.onClick = this.onClick.bind( this );
		this.handleKeyPress = this.handleKeyPress.bind( this );
	}

	componentWillMount() {
		if ( this.props.url ) {
			this.setState( { value: untrailingslashit( this.props.url ), shownValue: this.props.url } );
		} else {
			this.setState( { value: '', shownValue: '' } );
		}
	}

	componentDidUpdate() {
		if ( ! this.props.isError ) {
			return;
		}

		if ( ! this.refs.siteUrl.refs.textField ) {
			return;
		}

		this.refs.siteUrl.refs.textField.focus();
	}

	onChange( event ) {
		this.setState( {
			value: untrailingslashit( event.target.value ),
			shownValue: event.target.value
		}, this.props.onChange );
	}

	onClick() {
		this.props.onClick( this.state.value );
	}

	renderButtonLabel() {
		if ( ! this.props.isFetching ) {
			if ( ! this.props.isInstall ) {
				return i18n.translate( 'Connect Now' );
			}
			return i18n.translate( 'Start Installation' );
		}
		return i18n.translate( 'Connecting…' );
	}

	handleKeyPress( event ) {
		if ( 13 === event.keyCode ) {
			this.onClick();
		}
	}

	getTermsOfServiceUrl() {
		return 'https://' + i18n.getLocaleSlug() + '.wordpress.com/tos/';
	}

	renderTermsOfServiceLink() {
		return (
			<p className="jetpack-connect__tos-link">{
				i18n.translate(
					'By connecting your site you agree to our fascinating {{a}}Terms of Service{{/a}}.',
					{
						components: {
							a: <a
								className="jetpack-connect__tos-link-text"
								href={ this.getTermsOfServiceUrl() }
								onClick={ this.props.handleOnClickTos }
								target="_blank"
								rel="noopener noreferrer" />
						}
					}
				)
			}</p>
		);
	}

	render() {
		const hasError = this.props.isError && ( 'notExists' !== this.props.isError );
		const textInputProps = {
			ref: 'siteUrl',
			id: 'siteUrl',
			autoCapitalize: 'off',
			autoFocus: 'autofocus',
			onChange: this.onChange,
			disabled: this.props.isFetching,
			placeholder: i18n.translate( 'http://www.yoursite.com' ),
			onKeyUp: this.handleKeyPress,
			value: this.state.shownValue || ''
		};

		return (
			<div>
				<FormLabel htmlFor="siteUrl">{ i18n.translate( 'Site Address' ) }</FormLabel>
				<div className="jetpack-connect__site-address-container">
					<Gridicon
						size={ 24 }
						icon="globe" />
					<FormTextInput { ...textInputProps } />
					{ this.props.isFetching
						? ( <Spinner duration={ 30 } /> )
						: null }
				</div>
				<Card className="jetpack-connect__connect-button-card">
					{ this.renderTermsOfServiceLink() }
					<Button primary
						disabled={ ( ! this.state.value || this.props.isFetching || hasError ) }
						onClick={ this.onClick }>{ this.renderButtonLabel() }</Button>
				</Card>
			</div>
		);
	}
}

export default JetpackConnectSiteURLInput;
