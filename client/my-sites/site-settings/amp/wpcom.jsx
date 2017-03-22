/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import FormToggle from 'components/forms/form-toggle';
import { getSelectedSiteSlug } from 'state/ui/selectors';

class AmpWpcom extends Component {
	static propTypes = {
		submitForm: PropTypes.func.isRequired,
		trackEvent: PropTypes.func.isRequired,
		updateFields: PropTypes.func.isRequired,
		isSavingSettings: PropTypes.bool,
		isRequestingSettings: PropTypes.bool,
		fields: PropTypes.object,
	};

	static defaultProps = {
		isSavingSettings: false,
		isRequestingSettings: true,
		fields: {},
	};

	handleToggle = () => {
		const { fields, submitForm, trackEvent, updateFields } = this.props;
		updateFields( { amp_is_enabled: ! fields.amp_is_enabled }, () => {
			submitForm();
			trackEvent( 'Toggled AMP Toggle' );
		} );
	};

	handleCustomize = () => {
		this.props.trackEvent( 'Clicked AMP Customize button' );
		page( '/customize/amp/' + this.props.siteSlug );
	};

	render() {
		const {
			fields: {
				amp_is_supported: ampIsSupported,
				amp_is_enabled: ampIsEnabled
			},
			isRequestingSettings,
			isSavingSettings,
			translate
		} = this.props;

		const isDisabled = isRequestingSettings || isSavingSettings;
		const isCustomizeDisabled = isDisabled || ! ampIsEnabled;

		if ( ! ampIsSupported ) {
			return null;
		}

		return (
			<div className="amp__main site-settings__amp">
				<SectionHeader label={ translate( 'AMP' ) }>
					<Button
						compact
						disabled={ isCustomizeDisabled }
						onClick={ this.handleCustomize }>
						{ translate( 'Edit Design' ) }
					</Button>
					<FormToggle
						checked={ ampIsEnabled }
						onChange={ this.handleToggle }
						disabled={ isDisabled }
					/>
				</SectionHeader>
				<Card className="amp__explanation site-settings__amp-explanation">
					<p>
						{ translate(
							'Your WordPress.com site supports {{a}}Accelerated Mobile Pages (AMP){{/a}}, ' +
							'a new Google-led initiative that dramatically improves loading speeds ' +
							'on phones and tablets. {{a}}Learn More{{/a}}.',
							{
								components: {
									a: <a
										href="https://support.wordpress.com/google-amp-accelerated-mobile-pages/"
										target="_blank" rel="noopener noreferrer" />
								}
							}
						) }
					</p>
				</Card>
			</div>
		);
	}
}

export default connect(
	( state ) => ( {
		siteSlug: getSelectedSiteSlug( state ),
	} )
)( localize( AmpWpcom ) );
