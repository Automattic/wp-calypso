/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import QuerySitePlans from 'components/data/query-site-plans';
import FormTextInput from 'components/forms/form-text-input';
import SettingsSectionHeader from 'my-sites/site-settings/settings-section-header';
import { addQueryArgs } from 'lib/url';
import isSiteOnPaidPlan from 'state/selectors/is-site-on-paid-plan';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';

class DisconnectSurvey extends PureComponent {
	state = {
		otherReason: '',
		hasOtherReasonFocus: false,
	};

	interceptOtherReasonClick = ( event ) => {
		if ( ! this.state.otherReason || this.state.hasOtherReasonFocus ) {
			event.preventDefault();
		}
	};

	setOtherReason = ( event ) => {
		this.setState( { otherReason: event.target.value } );
	};

	setOtherReasonFocus = ( focus ) => () => {
		this.setState( { hasOtherReasonFocus: focus } );
	};

	render() {
		const { confirmHref, siteId, translate } = this.props;
		return (
			<div className="disconnect-site__survey main">
				<QuerySitePlans siteId={ siteId } />
				<SettingsSectionHeader
					title={ translate( 'Your feedback will help us improve the product.' ) }
				/>
				<CompactCard href={ confirmHref + '?reason=troubleshooting' }>
					{ translate( "Troubleshooting — I'll be reconnecting afterwards." ) }
				</CompactCard>
				<CompactCard href={ confirmHref + '?reason=cannot-work' }>
					{ translate( "I can't get it to work." ) }
				</CompactCard>
				<CompactCard href={ confirmHref + '?reason=slow' }>
					{ translate( 'It slowed down my site.' ) }
				</CompactCard>

				<CompactCard href={ confirmHref + '?reason=buggy' }>
					{ translate( "It's buggy." ) }
				</CompactCard>
				<CompactCard href={ confirmHref + '?reason=no-clarity' }>
					{ translate( "I don't know what it does." ) }
				</CompactCard>
				<CompactCard href={ confirmHref + '?reason=delete' }>
					{ translate( "I'm deleting/migrating my site." ) }
				</CompactCard>
				<CompactCard
					className="disconnect-site__survey-other-option"
					href={ addQueryArgs( { reason: 'other', text: this.state.otherReason }, confirmHref ) }
					onClick={ this.interceptOtherReasonClick }
				>
					{ translate( 'Other:' ) }
					<FormTextInput
						onBlur={ this.setOtherReasonFocus( false ) }
						onChange={ this.setOtherReason }
						onFocus={ this.setOtherReasonFocus( true ) }
						placeholder={ translate( 'share your experience…' ) }
						value={ this.state.otherReason }
					/>
				</CompactCard>
			</div>
		);
	}
}

DisconnectSurvey.propTypes = {
	confirmHref: PropTypes.string,
	// Provided by HOCs
	isPaidPlan: PropTypes.bool,
	siteId: PropTypes.number,
	siteSlug: PropTypes.string,
	translate: PropTypes.func,
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	return {
		isPaidPlan: isSiteOnPaidPlan( state, siteId ),
		siteId,
		siteSlug: getSelectedSiteSlug( state ),
	};
} )( localize( DisconnectSurvey ) );
