/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import TrackComponentView from 'lib/analytics/track-component-view';
import FormSectionHeading from 'components/forms/form-section-heading';
import FormFieldset from 'components/forms/form-fieldset';

export class BusinessATStep extends Component {
	static propTypes = {
		translate: PropTypes.func.isRequired,
	}

	static defaultProps = {
		translate: noop,
	}

	render() {
		const { translate } = this.props;
		const pluginLink = <a target="_blank" rel="noopener noreferrer" href="https://en.support.wordpress.com/plugins/" />;
		const themeLink = <a target="_blank" rel="noopener noreferrer" href="https://en.support.wordpress.com/themes/adding-new-themes/" />;

		return (
			<div>
				<FormSectionHeading>
					{ translate( 'New! Install Custom Plugins and Themes' ) }
				</FormSectionHeading>
				<FormFieldset>
					<p>
						{
							translate(
								'Have a theme or plugin you need to install to build the site you want? ' +
								'Now you can! ' +
								'Learn more about {{pluginLink}}installing plugins{{/pluginLink}} and ' +
								'{{themeLink}}uploading themes{{/themeLink}} today.',
								{ components: { pluginLink, themeLink } }
							)
						}
					</p>
					<p>
						{
							translate(
								'Are you sure you want to cancel your subscription and lose access to these new features?'
							)
						}
					</p>
					<TrackComponentView
						eventName="calypso_cancellation_business_at_impression"
						eventProperties={ { cta_name: 'cancellation_prompt' } }
					/>
				</FormFieldset>
			</div>
		);
	}
}

const mapStateToProps = null;
const mapDispatchToProps = null;

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)( localize( BusinessATStep ) );
