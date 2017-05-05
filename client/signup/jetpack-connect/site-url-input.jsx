/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize, getLocaleSlug } from 'i18n-calypso';
import Gridicon from 'gridicons';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import Spinner from 'components/spinner';

class JetpackConnectSiteUrlInput extends Component {
	static propTypes = {
		handleOnClickTos: PropTypes.func,
		isError: PropTypes.oneOfType( [
			PropTypes.string,
			PropTypes.bool,
		] ),
		isFetching: PropTypes.bool,
		isInstall: PropTypes.bool,
		onPushValue: PropTypes.func,
		onSubmit: PropTypes.func,
		url: PropTypes.string,
	};

	static defaultProps = {
		onPushValue: noop,
		url: '',
	};

	componentDidUpdate() {
		if ( ! this.props.isError ) {
			return;
		}

		if ( ! this.refs.siteUrl.refs.textField ) {
			return;
		}

		this.refs.siteUrl.refs.textField.focus();
	}

	handleChange = ( event ) => {
		this.props.onPushValue( event.target.value );
	};

	handleSubmit = () => this.props.onSubmit();

	handleKeyPress = ( event ) => {
		if ( 13 === event.keyCode ) {
			this.handleSubmit();
		}
	};

	renderButtonLabel() {
		const { translate } = this.props;
		if ( ! this.props.isFetching ) {
			if ( ! this.props.isInstall ) {
				return translate( 'Connect Now' );
			}
			return translate( 'Start Installation' );
		}
		return translate( 'Connecting…' );
	}

	getTermsOfServiceUrl() {
		return 'https://' + getLocaleSlug() + '.wordpress.com/tos/';
	}

	renderTermsOfServiceLink() {
		return (
			<p className="jetpack-connect__tos-link">{
				this.props.translate(
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
		const { translate } = this.props;
		const hasError = this.props.isError && ( 'notExists' !== this.props.isError );

		return (
			<div>
				<FormLabel htmlFor="siteUrl">{ translate( 'Site Address' ) }</FormLabel>
				<div className="jetpack-connect__site-address-container">
					<Gridicon
						size={ 24 }
						icon="globe" />
					<FormTextInput
						ref="siteUrl"
						id="siteUrl"
						autoCapitalize="off"
						autoFocus="autofocus"
						onChange={ this.handleChange }
						disabled={ this.props.isFetching }
						placeholder={ translate( 'http://www.yoursite.com' ) }
						onKeyUp={ this.handleKeyPress }
						value={ this.props.url }
					/>
					{ this.props.isFetching
						? <Spinner duration={ 30 } />
						: null
					}
				</div>
				<Card className="jetpack-connect__connect-button-card">
					{ this.renderTermsOfServiceLink() }
					<Button primary
						disabled={ ( ! this.props.url || this.props.isFetching || hasError ) }
						onClick={ this.handleSubmit }>{ this.renderButtonLabel() }</Button>
				</Card>
			</div>
		);
	}
}

export default localize( JetpackConnectSiteUrlInput );
