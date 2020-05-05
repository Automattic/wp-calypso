/**
 * External dependencies
 */
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import FormFieldset from 'components/forms/form-fieldset';
import SiteVerticalsSuggestionSearch from 'components/site-verticals-suggestion-search';
import { setSiteVertical } from 'state/signup/steps/site-vertical/actions';
import {
	getSiteVerticalName,
	getSiteVerticalSlug,
	getSiteVerticalIsUserInput,
	getSiteVerticalId,
	getSiteVerticalParentId,
	getSiteVerticalSuggestedTheme,
} from 'state/signup/steps/site-vertical/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import { getSiteType } from 'state/signup/steps/site-type/selectors';
import { getVerticals } from 'state/signup/verticals/selectors';
import { getSiteTypePropertyValue } from 'lib/signup/site-type';

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

	onSiteTopicChange = ( verticalData ) => {
		this.props.setSiteVertical( {
			isUserInput: verticalData.isUserInputVertical,
			name: verticalData.verticalName,
			preview: verticalData.preview,
			slug: verticalData.verticalSlug,
			id: verticalData.verticalId,
			parentId: verticalData.parent,
			suggestedTheme: verticalData.suggestedTheme,
		} );
	};

	onSubmit = ( event ) => {
		const {
			isUserInput,
			siteSlug,
			siteTopic,
			suggestedTheme,
			verticalId,
			verticalParentId,
		} = this.props;

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
			suggestedTheme,
		} );
	};

	render() {
		const { isButtonDisabled, siteTopic, siteType } = this.props;
		const suggestionSearchInputPlaceholder =
			getSiteTypePropertyValue( 'slug', siteType, 'siteTopicInputPlaceholder' ) || '';
		const headerText = getSiteTypePropertyValue( 'slug', siteType, 'siteTopicLabel' ) || '';

		return (
			<div className={ classNames( 'site-topic__content', { 'is-empty': ! siteTopic } ) }>
				<form onSubmit={ this.onSubmit }>
					<FormFieldset>
						<SiteVerticalsSuggestionSearch
							placeholder={ suggestionSearchInputPlaceholder }
							labelText={ headerText }
							onChange={ this.onSiteTopicChange }
							showPopular={ true }
							searchValue={ siteTopic }
							autoFocus={ true } // eslint-disable-line jsx-a11y/no-autofocus
							siteType={ siteType }
						/>
						<Button
							title={ this.props.translate( 'Continue' ) }
							aria-label={ this.props.translate( 'Continue' ) }
							type="submit"
							disabled={ isButtonDisabled }
							primary
						>
							{ this.props.translate( 'Continue' ) }
						</Button>
					</FormFieldset>
				</form>
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const siteType = getSiteType( state );
		const siteTopic = getSiteVerticalName( state );
		const isButtonDisabled = ! siteTopic || null == getVerticals( state, siteTopic, siteType );

		return {
			siteTopic,
			siteType,
			siteSlug: getSiteVerticalSlug( state ),
			suggestedTheme: getSiteVerticalSuggestedTheme( state ),
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
