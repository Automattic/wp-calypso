/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { get, flow, includes, noop } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import FormButton from 'components/forms/form-button';
import TextInput from 'components/forms/form-text-input';
import { jpTestSubmitUrl } from 'state/jetpack-importer-test/actions';

class ImporterUrlInput extends Component {
	state = {
		inputValue: '',
	};

	static propTypes = {
		icon: PropTypes.string,
	};

	validateOnEnter = () => {};

	validateSite = () => {
		this.props.jpTestSubmitUrl( this.state.inputValue );
	};

	setUrl = event =>
		this.setState( {
			inputValue: event.target.value,
		} );

	render() {
		const { jetpackImporterTest: { requesting = false, detectedService = null } = {} } = this.props;

		return (
			<div className="site-importer__site-importer-pane">
				<div>
					<p>Enter a URL</p>
					<div className="site-importer__site-importer-url-input">
						<TextInput
							disabled={ requesting }
							onChange={ this.setUrl }
							onKeyPress={ this.validateOnEnter }
							value={ this.state.inputValue }
							placeholder="https://example.com/"
						/>
						<FormButton
							primary
							disabled={ requesting }
							busy={ requesting }
							onClick={ this.validateSite }
						>
							{ this.props.translate( 'Continue' ) }
						</FormButton>
					</div>
					{ detectedService === 'unsupported' && (
						<Notice
							status="is-error"
							text={ 'unfortunately, importing from this service is unsupported' }
							showDismiss={ false }
						/>
					) }
				</div>
			</div>
		);
	}
}

export default flow(
	connect(
		state => ( {
			jetpackImporterTest: get( state, 'jetpackImporterTest' ),
		} ),
		{ jpTestSubmitUrl }
	),
	localize
)( ImporterUrlInput );
