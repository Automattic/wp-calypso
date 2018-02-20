/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'gridicons';
import { localize, getLocaleSlug } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import Spinner from 'components/spinner';

class JetpackConnectSiteUrlInput extends PureComponent {
	static propTypes = {
		handleOnClickTos: PropTypes.func,
		isError: PropTypes.oneOfType( [ PropTypes.string, PropTypes.bool ] ),
		isFetching: PropTypes.bool,
		isInstall: PropTypes.bool,
		onChange: PropTypes.func,
		onSubmit: PropTypes.func,
		translate: PropTypes.func.isRequired,
		url: PropTypes.string,
	};

	static defaultProps = {
		onChange: noop,
		url: '',
	};

	focusInput = noop;

	refInput = formInputComponent => {
		this.focusInput = () => formInputComponent.focus();
	};

	componentDidUpdate() {
		if ( ! this.props.isError ) {
			return;
		}

		this.focusInput();
	}

	handleKeyPress = event => {
		if ( 13 === event.keyCode ) {
			this.props.onSubmit();
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

	getTermsOfJetpackSyncUrl() {
		return 'https://jetpack.com/support/what-data-does-jetpack-sync/';
	}

	getTermsOfServiceUrl() {
		return 'https://' + getLocaleSlug() + '.wordpress.com/tos/';
	}

	renderTermsOfServiceLink() {
		return (
			<p className="jetpack-connect__tos-link">
				{ this.props.translate(
					'By connecting you agree to our fascinating {{tosLinkText}}Terms of Service{{/tosLinkText}} ' +
						'and to sync {{syncLinkText}}certain data and settings{{/syncLinkText}} to WordPress.com',
					{
						components: {
							tosLinkText: (
								<a
									className="jetpack-connect__tos-link-text"
									href={ this.getTermsOfServiceUrl() }
									onClick={ this.props.handleOnClickTos }
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
							syncLinkText: (
								<a
									className="jetpack-connect__sync-link-text"
									href={ this.getTermsOfJetpackSyncUrl() }
									onClick={ this.props.handleOnClickTos }
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
						},
					}
				) }
			</p>
		);
	}

	render() {
		const { isError, isFetching, onChange, onSubmit, translate, url } = this.props;
		const hasError = isError && 'notExists' !== isError;

		return (
			<div>
				<FormLabel htmlFor="siteUrl">{ translate( 'Site Address' ) }</FormLabel>
				<div className="jetpack-connect__site-address-container">
					<Gridicon size={ 24 } icon="globe" />
					<FormTextInput
						ref={ this.refInput }
						id="siteUrl"
						autoCapitalize="off"
						autoFocus="autofocus"
						onChange={ onChange }
						disabled={ isFetching }
						placeholder={ 'http://yourjetpack.blog' }
						onKeyUp={ this.handleKeyPress }
						value={ url }
					/>
					{ isFetching ? <Spinner duration={ 30 } /> : null }
				</div>
				<Card className="jetpack-connect__connect-button-card">
					{ this.renderTermsOfServiceLink() }
					<Button
						className="jetpack-connect__connect-button"
						primary
						disabled={ ! url || isFetching || hasError }
						onClick={ onSubmit }
					>
						{ this.renderButtonLabel() }
					</Button>
				</Card>
			</div>
		);
	}
}

export default localize( JetpackConnectSiteUrlInput );
