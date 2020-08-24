/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import FormSectionHeading from 'components/forms/form-section-heading';
import FormFieldset from 'components/forms/form-fieldset';
import { localizeUrl } from 'lib/i18n-utils';

export class BusinessATStep extends Component {
	static propTypes = {
		recordTracksEvent: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		translate: noop,
	};

	onClickPluginSupport = () => {
		this.props.recordTracksEvent( 'calypso_cancellation_business_at_plugin_support_click' );
	};

	onClickThemeSupport = () => {
		this.props.recordTracksEvent( 'calypso_cancellation_business_at_theme_support_click' );
	};

	render() {
		const { translate } = this.props;
		const pluginLink = (
			<a
				onClick={ this.onClickPluginSupport }
				target="_blank"
				rel="noopener noreferrer"
				href={ localizeUrl( 'https://wordpress.com/support/plugins/' ) }
			/>
		);
		const themeLink = (
			<a
				onClick={ this.onClickThemeSupport }
				target="_blank"
				rel="noopener noreferrer"
				href={ localizeUrl( 'https://wordpress.com/support/themes/adding-new-themes/' ) }
			/>
		);

		return (
			<div>
				<FormSectionHeading>
					{ translate( 'New! Install Custom Plugins and Themes' ) }
				</FormSectionHeading>
				<FormFieldset>
					<p>
						{ translate(
							'Have a theme or plugin you need to install to build the site you want? ' +
								'Now you can! ' +
								'Learn more about {{pluginLink}}installing plugins{{/pluginLink}} and ' +
								'{{themeLink}}uploading themes{{/themeLink}} today.',
							{ components: { pluginLink, themeLink } }
						) }
					</p>
					<p>
						{ translate(
							'Are you sure you want to cancel your subscription and lose access to these new features?'
						) }
					</p>
				</FormFieldset>
			</div>
		);
	}
}

const mapStateToProps = null;
const mapDispatchToProps = { recordTracksEvent };

export default connect( mapStateToProps, mapDispatchToProps )( localize( BusinessATStep ) );
