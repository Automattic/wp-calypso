/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'calypso/components/gridicon';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { Card, Button } from '@automattic/components';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import Spinner from 'calypso/components/spinner';
import SuggestionSearch from 'calypso/components/suggestion-search';
import { localizeUrl } from 'calypso/lib/i18n-utils';

class JetpackConnectSiteUrlInput extends Component {
	static propTypes = {
		handleOnClickTos: PropTypes.func,
		isError: PropTypes.oneOfType( [ PropTypes.string, PropTypes.bool ] ),
		isFetching: PropTypes.bool,
		isInstall: PropTypes.bool,
		onChange: PropTypes.func,
		onSubmit: PropTypes.func,
		translate: PropTypes.func.isRequired,
		url: PropTypes.string,
		autoFocus: PropTypes.bool,
		isSearch: PropTypes.bool,
	};

	static defaultProps = {
		candidateSites: [],
		onChange: noop,
		url: '',
		autoFocus: true,
	};

	focusInput = noop;

	refInput = ( formInputComponent ) => {
		this.focusInput = () => formInputComponent.focus();
	};

	componentDidUpdate() {
		if ( ! this.props.isError ) {
			return;
		}

		this.focusInput();
	}

	handleKeyPress = ( event ) => {
		if ( 13 === event.keyCode && ! this.isFormSubmitDisabled() ) {
			this.props.onSubmit();
		}
	};

	renderButtonLabel() {
		const { isSearch, translate } = this.props;
		if ( ! this.props.isFetching ) {
			if ( ! this.props.isInstall ) {
				return translate( 'Continue' );
			}

			return isSearch ? translate( 'Get Search' ) : translate( 'Start Installation' );
		}
		return translate( 'Setting up…' );
	}

	getTermsOfJetpackSyncUrl() {
		return localizeUrl( 'https://jetpack.com/support/what-data-does-jetpack-sync/' );
	}

	getTermsOfServiceUrl() {
		return localizeUrl( 'https://wordpress.com/tos/' );
	}

	isFormSubmitDisabled() {
		const { isError, isFetching, url } = this.props;
		const hasError = isError && 'notExists' !== isError;

		return ! url || isFetching || hasError;
	}

	renderTermsOfServiceLink() {
		return (
			<p className="jetpack-connect__tos-link">
				{ this.props.translate(
					'By setting up Jetpack you agree to our {{tosLinkText}}Terms of Service{{/tosLinkText}} ' +
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
		const {
			candidateSites,
			isFetching,
			onChange,
			onSubmit,
			isSearch,
			translate,
			url,
			autoFocus,
		} = this.props;

		return (
			<div>
				<FormLabel htmlFor="siteUrl">{ translate( 'Site Address' ) }</FormLabel>
				<div className="jetpack-connect__site-address-container">
					<Gridicon size={ 24 } icon="globe" />
					{ ! isSearch && (
						<FormTextInput
							ref={ this.refInput }
							id="siteUrl"
							autoCapitalize="off"
							autoFocus={ autoFocus } // eslint-disable-line jsx-a11y/no-autofocus
							onChange={ onChange }
							disabled={ isFetching }
							placeholder={ 'https://yourjetpack.blog' }
							onKeyUp={ this.handleKeyPress }
							value={ url }
						/>
					) }
					{ isSearch && (
						<SuggestionSearch
							id="siteSelection"
							placeholder={ 'Type your site' }
							onChange={ onChange }
							suggestions={ candidateSites }
							value={ url }
						/>
					) }
					{ isFetching ? <Spinner /> : null }
				</div>
				<Card className="jetpack-connect__connect-button-card">
					{ this.renderTermsOfServiceLink() }
					<Button
						className="jetpack-connect__connect-button"
						primary
						disabled={ this.isFormSubmitDisabled() }
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
