/** @format */

/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import FormFieldset from 'components/forms/form-fieldset';
import SiteVerticalsSuggestionSearch from 'components/site-verticals-suggestion-search';
import { setSiteVertical } from 'state/signup/steps/site-vertical/actions';
import {
	getSiteVerticalName,
	getSiteVerticalSlug,
	getSiteVerticalIsUserInput,
	getSiteVerticalId,
	getSiteVerticalParentId,
} from 'state/signup/steps/site-vertical/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import { getVerticals } from 'state/signup/verticals/selectors';

/**
 * Style dependencies
 */
import './style.scss';

class SiteTopicForm extends Component {
	static propTypes = {
		submitForm: PropTypes.func.isRequired,

		// from localize() HoC
		translate: PropTypes.func.isRequired,
	};

	onSiteTopicChange = verticalData => {
		this.props.setSiteVertical( {
			isUserInput: verticalData.isUserInputVertical,
			name: verticalData.verticalName,
			preview: verticalData.preview,
			slug: verticalData.verticalSlug,
			id: verticalData.verticalId,
			parentId: verticalData.parent,
		} );
	};

	onSubmit = event => {
		const { isUserInput, siteSlug, siteTopic, verticalId, verticalParentId } = this.props;

		event.preventDefault();

		this.props.recordTracksEvent( 'calypso_signup_actions_submit_site_topic', {
			value: siteSlug,
			is_user_input_vertical: isUserInput,
			parent_id: verticalParentId || verticalId,
		} );

		this.props.submitForm( {
			isUserInput,
			name: siteTopic,
			slug: siteSlug,
			parentId: verticalParentId,
			id: verticalId,
		} );
	};

	render() {
		const { isButtonDisabled, siteTopic, translate } = this.props;
		return (
			<div className="site-topic__content">
				<form onSubmit={ this.onSubmit }>
					<FormFieldset>
						<SiteVerticalsSuggestionSearch
							onChange={ this.onSiteTopicChange }
							showPopular={ true }
							searchValue={ siteTopic }
							autoFocus={ true } // eslint-disable-line jsx-a11y/no-autofocus
						/>
						<Button type="submit" disabled={ isButtonDisabled } primary>
							{ translate( 'Continue' ) }
						</Button>
					</FormFieldset>
				</form>
			</div>
		);
	}
}

export default connect(
	state => {
		const siteTopic = getSiteVerticalName( state );
		const isVerticalSearchPending = null == getVerticals( state, siteTopic );
		const isButtonDisabled = ! siteTopic || isVerticalSearchPending;

		return {
			siteTopic,
			siteSlug: getSiteVerticalSlug( state ),
			isUserInput: getSiteVerticalIsUserInput( state ),
			isButtonDisabled,
			verticalId: getSiteVerticalId( state ),
			verticalParentId: getSiteVerticalParentId( state ),
		};
	},
	{
		recordTracksEvent,
		setSiteVertical,
	}
)( localize( SiteTopicForm ) );
