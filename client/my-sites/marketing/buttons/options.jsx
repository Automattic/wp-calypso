/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { filter, flowRight, get, partial, some, values, xor } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Banner from 'components/banner';
import MultiCheckbox from 'components/forms/multi-checkbox';
import SupportInfo from 'components/support-info';
import { getPostTypes } from 'state/post-types/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSettings } from 'state/site-settings/selectors';
import getCurrentRouteParameterized from 'state/selectors/get-current-route-parameterized';
import getSharingButtons from 'state/selectors/get-sharing-buttons';
import { isJetpackSite, isJetpackMinimumVersion, getSiteAdminUrl } from 'state/sites/selectors';
import QueryPostTypes from 'components/data/query-post-types';
import { recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';

/* eslint-disable wpcalypso/jsx-classname-namespace */

class SharingButtonsOptions extends Component {
	static propTypes = {
		buttons: PropTypes.array,
		initialized: PropTypes.bool,
		isJetpack: PropTypes.bool,
		isTwitterButtonAllowed: PropTypes.bool,
		onChange: PropTypes.func,
		postTypes: PropTypes.array,
		recordGoogleEvent: PropTypes.func,
		saving: PropTypes.bool,
		siteId: PropTypes.number,
		translate: PropTypes.func,
		settings: PropTypes.object,
	};

	static defaultProps = {
		settings: Object.freeze( {} ),
		onChange: () => {},
		initialized: false,
		saving: false,
	};

	getSanitizedTwitterUsername( username ) {
		return username ? '@' + username.replace( /\W/g, '' ).substr( 0, 15 ) : '';
	}

	trackTwitterViaAnalyticsEvent = () => {
		const { path } = this.props;
		this.props.recordTracksEvent( 'calypso_sharing_buttons_twitter_username_field_focused', {
			path,
		} );
		this.props.recordGoogleEvent( 'Sharing', 'Focussed Twitter Username Field' );
	};

	handleMultiCheckboxChange = ( name, event ) => {
		const { path } = this.props;
		const delta = xor( this.props.settings.sharing_show, event.value );
		this.props.onChange( name, event.value );
		if ( delta.length ) {
			const checked = -1 !== event.value.indexOf( delta[ 0 ] ) ? 1 : 0;
			this.props.recordTracksEvent( 'calypso_sharing_buttons_show_buttons_on_page_click', {
				page: delta[ 0 ],
				checked,
				path,
			} );
			this.props.recordGoogleEvent(
				'Sharing',
				'Clicked Show Sharing Buttons On Page Checkbox',
				delta[ 0 ],
				checked
			);
		}
	};

	handleTwitterViaChange = event => {
		this.props.onChange(
			event.target.name,
			this.getSanitizedTwitterUsername( event.target.value )
		);
	};

	handleChange = event => {
		const { path } = this.props;

		let value;
		if ( 'checkbox' === event.target.type ) {
			value = event.target.checked;
		} else {
			value = event.target.value;
		}

		if ( 'jetpack_comment_likes_enabled' === event.target.name ) {
			const checked = event.target.checked ? 1 : 0;
			this.props.recordTracksEvent( 'calypso_sharing_buttons_likes_on_for_all_posts_click', {
				checked,
				path,
			} );
			this.props.recordGoogleEvent(
				'Sharing',
				'Clicked Comment Likes On For All Posts Checkbox',
				'checked',
				checked
			);
		}

		this.props.onChange( event.target.name, value );
	};

	getPostTypeLabel( postType ) {
		let label;

		switch ( postType.name ) {
			case 'index':
				label = this.props.translate( 'Front Page, Archive Pages, and Search Results', {
					context: 'jetpack',
				} );
				break;
			case 'post':
				label = this.props.translate( 'Posts' );
				break;
			case 'page':
				label = this.props.translate( 'Pages' );
				break;
			case 'attachment':
				label = this.props.translate( 'Media' );
				break;
			case 'portfolio':
				label = this.props.translate( 'Portfolio Items' );
				break;
			default:
				label = postType.label;
		}

		return label;
	}

	getDisplayOptions() {
		return [ { name: 'index' } ].concat( this.props.postTypes ).map( postType => ( {
			value: postType.name,
			label: this.getPostTypeLabel( postType ),
		} ) );
	}

	isTwitterButtonEnabled() {
		return some( this.props.buttons, { ID: 'twitter', enabled: true } );
	}

	getTwitterViaOptionElement() {
		const { isJetpack, initialized, isTwitterButtonAllowed, settings, translate } = this.props;
		if ( ! this.isTwitterButtonEnabled() || ! isTwitterButtonAllowed ) {
			return;
		}

		const option = isJetpack ? 'jetpack-twitter-cards-site-tag' : 'twitter_via';

		return (
			<fieldset className="sharing-buttons__fieldset">
				<legend className="sharing-buttons__fieldset-heading">
					{ translate( 'Twitter username' ) }
				</legend>
				<input
					name={ option }
					type="text"
					placeholder={ '@' + translate( 'username' ) }
					value={ this.getSanitizedTwitterUsername( settings[ option ] ) }
					onChange={ this.handleTwitterViaChange }
					onFocus={ this.trackTwitterViaAnalyticsEvent }
					disabled={ ! initialized }
				/>
				<p className="sharing-buttons__fieldset-detail">
					{ translate(
						'This will be included in tweets when people share using the Twitter button.'
					) }
				</p>
			</fieldset>
		);
	}

	getCommentLikesOptionElement() {
		const { isJetpack, initialized, settings, translate } = this.props;

		if ( isJetpack ) {
			return;
		}

		const checked = get( settings, 'jetpack_comment_likes_enabled', false );

		return (
			<fieldset className="sharing-buttons__fieldset">
				<legend className="sharing-buttons__fieldset-heading">
					{ translate( 'Comment Likes', { context: 'Sharing options: Header' } ) }
				</legend>
				<label>
					<input
						name="jetpack_comment_likes_enabled"
						type="checkbox"
						checked={ checked }
						onChange={ this.handleChange }
						disabled={ ! initialized }
					/>
					<span>
						{ translate( 'On for all posts', { context: 'Sharing options: Comment Likes' } ) }
					</span>
					<SupportInfo
						text={ translate(
							"Encourage your community by giving readers the ability to show appreciation for one another's comments."
						) }
						link="https://support.wordpress.com/comment-likes/"
						privacyLink={ false }
						position={ 'bottom left' }
					/>
				</label>
			</fieldset>
		);
	}

	getSharingShowOptionsElement = () => {
		const { initialized, isSharingShowAllowed, settings, translate } = this.props;

		if ( ! isSharingShowAllowed ) {
			return;
		}

		const changeSharingPostTypes = partial( this.handleMultiCheckboxChange, 'sharing_show' );
		return (
			<fieldset className="sharing-buttons__fieldset">
				<legend className="sharing-buttons__fieldset-heading">
					{ translate( 'Show like and sharing buttons on', {
						context: 'Sharing options: Header',
						comment:
							'Possible values are: "Front page, Archive Pages, and Search Results", "Posts", "Pages", "Media"',
					} ) }
				</legend>
				<MultiCheckbox
					name="sharing_show"
					options={ this.getDisplayOptions() }
					checked={ settings.sharing_show }
					onChange={ changeSharingPostTypes }
					disabled={ ! initialized }
				/>
			</fieldset>
		);
	};

	getWpAdminBanner = () => {
		const { isSharingShowAllowed, siteAdminUrl, translate } = this.props;
		if ( isSharingShowAllowed ) {
			return;
		}
		return (
			<Banner
				className="sharing-buttons__banner"
				href={ `${ siteAdminUrl }options-general.php?page=sharing` }
				title={ translate( 'Visit WP Admin for more sharing buttons options.' ) }
			/>
		);
	};

	render() {
		const { initialized, saving, siteId, translate } = this.props;

		return (
			<Fragment>
				<div className="sharing-buttons__panel">
					{ siteId && <QueryPostTypes siteId={ siteId } /> }
					<h4>{ translate( 'Options' ) }</h4>
					<div className="sharing-buttons__fieldset-group">
						{ this.getSharingShowOptionsElement() }
						{ this.getCommentLikesOptionElement() }
						{ this.getTwitterViaOptionElement() }
					</div>

					<button
						type="submit"
						className="button sharing-buttons__submit"
						disabled={ saving || ! initialized }
					>
						{ saving ? translate( 'Saving…' ) : translate( 'Save Changes' ) }
					</button>
				</div>
				{ this.getWpAdminBanner() }
			</Fragment>
		);
	}
}

const connectComponent = connect(
	state => {
		const siteId = getSelectedSiteId( state );
		const isJetpack = isJetpackSite( state, siteId );
		const isTwitterButtonAllowed =
			! isJetpack || isJetpackMinimumVersion( state, siteId, '3.4-dev' );
		const isSharingShowAllowed = ! isJetpack || isJetpackMinimumVersion( state, siteId, '7.3' );
		const path = getCurrentRouteParameterized( state, siteId );

		const postTypes = filter( values( getPostTypes( state, siteId ) ), 'public' );

		return {
			buttons: getSharingButtons( state, siteId ),
			initialized: !! postTypes || !! getSiteSettings( state, siteId ),
			isJetpack,
			isSharingShowAllowed,
			isTwitterButtonAllowed,
			path,
			postTypes,
			siteAdminUrl: getSiteAdminUrl( state, siteId ),
			siteId,
		};
	},
	{ recordGoogleEvent, recordTracksEvent }
);

export default flowRight(
	connectComponent,
	localize
)( SharingButtonsOptions );
