/**
 * External dependencies
 */
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import Gridicon from 'components/gridicon';
import Spinner from 'components/spinner';
import untrailingslashit from 'lib/route/untrailingslashit';

export default React.createClass( {
	displayName: 'JetpackConnectSiteURLInput',

	componentDidUpdate() {
		if ( ! this.props.isError ) {
			return;
		}

		if ( ! this.refs.siteUrl.refs.textField ) {
			return;
		}

		this.refs.siteUrl.refs.textField.focus();
	},

	getInitialState() {
		return {
			value: ''
		};
	},

	onChange( event ) {
		this.setState( {
			value: untrailingslashit( event.target.value )
		}, this.props.onChange );
	},

	renderButtonLabel() {
		if ( ! this.props.isFetching ) {
			if ( ! this.props.isInstall ) {
				return this.translate( 'Connect Now' );
			}
			return this.translate( 'Start Installation' );
		}
		return this.translate( 'Connecting…' );
	},

	handleKeyPress( event ) {
		if ( 13 === event.keyCode ) {
			this.props.onClick();
		}
	},

	getTermsOfServiceUrl() {
		return 'https://' + i18n.getLocaleSlug() + '.wordpress.com/tos/';
	},

	renderTermsOfServiceLink() {
		return (
			<p className="jetpack-connect__tos-link">{
				this.translate(
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
	},

	render() {
		const hasError = this.props.isError && ( 'notExists' !== this.props.isError );
		return (
			<div>
				<FormLabel htmlFor="siteUrl">{ this.translate( 'Site Address' ) }</FormLabel>
				<div className="jetpack-connect__site-address-container">
					<Gridicon
						size={ 24 }
						icon="globe" />
					<FormTextInput
						ref="siteUrl"
						id="siteUrl"
						autoCapitalize="off"
						autoFocus="autofocus"
						onChange={ this.onChange }
						disabled={ this.props.isFetching }
						placeholder={ this.translate( 'http://www.yoursite.com' ) }
						onKeyUp={ this.handleKeyPress } />
					{ this.props.isFetching
						? ( <Spinner duration={ 30 } /> )
						: null }
				</div>
				<Card className="jetpack-connect__connect-button-card">
					{ this.renderTermsOfServiceLink() }
					<Button primary
						disabled={ ( ! this.state.value || this.props.isFetching || hasError ) }
						onClick={ this.props.onClick }>{ this.renderButtonLabel() }</Button>
				</Card>
			</div>
		);
	}

} );
