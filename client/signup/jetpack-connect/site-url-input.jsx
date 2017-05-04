/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize, getLocaleSlug } from 'i18n-calypso';
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
	static propTypes = {
		handleOnClickTos: PropTypes.func,
		isError: PropTypes.oneOfType( [
			PropTypes.string,
			PropTypes.bool,
		] ),
		isFetching: PropTypes.bool,
		isInstall: PropTypes.bool,
		onChange: PropTypes.func,
		onClick: PropTypes.func,
		url: PropTypes.string,
	};

	constructor( props ) {
		super( props );

		this.state = this.props.url
			? { value: untrailingslashit( this.props.url ), shownValue: this.props.url }
			: { value: '', shownValue: '' };
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

	handleChange = ( event ) => {
		this.setState( {
			value: untrailingslashit( event.target.value ),
			shownValue: event.target.value
		}, this.props.onChange );
	};

	handleClick = () => this.props.onClick( this.state.value );

	handleKeyPress = ( event ) => {
		if ( 13 === event.keyCode ) {
			this.handleClick();
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
						value={ this.state.shownValue || '' }
					/>
					{ this.props.isFetching
						? <Spinner duration={ 30 } />
						: null
					}
				</div>
				<Card className="jetpack-connect__connect-button-card">
					{ this.renderTermsOfServiceLink() }
					<Button primary
						disabled={ ( ! this.state.value || this.props.isFetching || hasError ) }
						onClick={ this.handleClick }>{ this.renderButtonLabel() }</Button>
				</Card>
			</div>
		);
	}
}

export default localize( JetpackConnectSiteURLInput );
