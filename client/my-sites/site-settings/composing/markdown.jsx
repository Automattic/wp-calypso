/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import ExternalLink from 'components/external-link';
import JetpackModuleToggle from '../jetpack-module-toggle';

class Markdown extends PureComponent {
	static propTypes = {
		disabled: PropTypes.bool,
		siteId: PropTypes.number,
		translate: PropTypes.func,
	};

	render() {
		const { disabled, siteId, translate } = this.props;

		return (
			<FormFieldset className="composing__markdown has-divider is-top-only">
				<JetpackModuleToggle
					disabled={ disabled }
					label={ translate( 'Write posts or pages in plain-text Markdown syntax' ) }
					moduleSlug="markdown"
					siteId={ siteId }
				/>
				<FormSettingExplanation isIndented>
					<ExternalLink href="https://jetpack.com/support/markdown/">
						{ translate( 'Learn more' ) }
					</ExternalLink>
				</FormSettingExplanation>
			</FormFieldset>
		);
	}
}

export default localize( Markdown );
