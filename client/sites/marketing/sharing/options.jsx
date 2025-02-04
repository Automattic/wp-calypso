import { FormLabel } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { localize } from 'i18n-calypso';
import { filter, flowRight, get, some, values, xor } from 'lodash';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import QueryPostTypes from 'calypso/components/data/query-post-types';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import MultiCheckbox from 'calypso/components/forms/multi-checkbox';
import { PanelCard } from 'calypso/components/panel';
import SupportInfo from 'calypso/components/support-info';
import { recordGoogleEvent, recordTracksEvent } from 'calypso/state/analytics/actions';
import { getPostTypes } from 'calypso/state/post-types/selectors';
import getCurrentRouteParameterized from 'calypso/state/selectors/get-current-route-parameterized';
import { getSiteSettings } from 'calypso/state/site-settings/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

/* eslint-disable wpcalypso/jsx-classname-namespace */

class SharingButtonsOptions extends Component {
	static propTypes = {
		buttons: PropTypes.array,
		initialized: PropTypes.bool,
		isJetpack: PropTypes.bool,
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

	handleTwitterViaChange = ( event ) => {
		this.props.onChange(
			event.target.name,
			this.getSanitizedTwitterUsername( event.target.value )
		);
	};

	handleChange = ( event ) => {
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
					context: 'Show like and sharing buttons on',
				} );
				break;
			case 'post':
				label = this.props.translate( 'Posts', { context: 'Show like and sharing buttons on' } );
				break;
			case 'page':
				label = this.props.translate( 'Pages', { context: 'Show like and sharing buttons on' } );
				break;
			case 'attachment':
				label = this.props.translate( 'Media', { context: 'Show like and sharing buttons on' } );
				break;
			case 'portfolio':
				label = this.props.translate( 'Portfolio Items', {
					context: 'Show like and sharing buttons on',
				} );
				break;
			default:
				label = postType.label;
		}

		return label;
	}

	getDisplayOptions() {
		return [ { name: 'index' } ].concat( this.props.postTypes ).map( ( postType ) => ( {
			value: postType.name,
			label: this.getPostTypeLabel( postType ),
		} ) );
	}

	isTwitterButtonEnabled() {
		return some( this.props.buttons, { ID: 'twitter', enabled: true } );
	}

	isXButtonEnabled() {
		return some( this.props.buttons, { ID: 'x', enabled: true } );
	}

	getTwitterViaOptionElement() {
		const { isJetpack, initialized, settings, translate } = this.props;

		const isTwitterButtonEnabled = this.isTwitterButtonEnabled();
		const isXButtonEnabled = this.isXButtonEnabled();
		if ( ! isTwitterButtonEnabled && ! isXButtonEnabled ) {
			return;
		}

		const option = isJetpack ? 'jetpack-twitter-cards-site-tag' : 'twitter_via';
		const serviceName = isTwitterButtonEnabled ? 'Twitter' : 'X';

		return (
			<FormFieldset className="sharing-buttons__fieldset">
				<legend className="sharing-buttons__fieldset-heading">
					{ translate( '%(service)s username', {
						args: { service: serviceName },
					} ) }
				</legend>
				<FormTextInput
					name={ option }
					placeholder={ '@' + translate( 'username' ) }
					value={ this.getSanitizedTwitterUsername( settings[ option ] ) }
					onChange={ this.handleTwitterViaChange }
					onFocus={ this.trackTwitterViaAnalyticsEvent }
					disabled={ ! initialized }
				/>
				<p className="sharing-buttons__fieldset-detail">
					{ translate(
						'This will be included in tweets when people share using the %(service)s button.',
						{
							args: { service: serviceName },
						}
					) }
				</p>
			</FormFieldset>
		);
	}

	getCommentLikesOptionElement() {
		const { isJetpack, initialized, settings, translate } = this.props;

		if ( isJetpack ) {
			return;
		}

		const checked = get( settings, 'jetpack_comment_likes_enabled', false );

		return (
			<FormFieldset className="sharing-buttons__fieldset">
				<legend className="sharing-buttons__fieldset-heading">
					{ translate( 'Comment Likes', { context: 'Sharing options: Header' } ) }
				</legend>
				<FormLabel>
					<FormInputCheckbox
						name="jetpack_comment_likes_enabled"
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
						link={ localizeUrl( 'https://wordpress.com/support/comment-likes/' ) }
						privacyLink={ false }
						position="bottom left"
					/>
				</FormLabel>
			</FormFieldset>
		);
	}

	getSharingShowOptionsElement = () => {
		const { initialized, settings, translate } = this.props;

		const changeSharingPostTypes = ( event ) =>
			this.handleMultiCheckboxChange( 'sharing_show', event );

		return (
			<FormFieldset className="sharing-buttons__fieldset">
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
			</FormFieldset>
		);
	};

	render() {
		const { initialized, saving, siteId, translate } = this.props;

		return (
			<Fragment>
				<PanelCard className="sharing-buttons__panel">
					{ siteId && <QueryPostTypes siteId={ siteId } /> }
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
						{ saving ? translate( 'Saving…' ) : translate( 'Save changes' ) }
					</button>
				</PanelCard>
			</Fragment>
		);
	}
}

const connectComponent = connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const path = getCurrentRouteParameterized( state, siteId );

		const postTypes = filter( values( getPostTypes( state, siteId ) ), 'public' );

		return {
			initialized: !! postTypes || !! getSiteSettings( state, siteId ),
			isJetpack: isJetpackSite( state, siteId ),
			path,
			postTypes,
			siteId,
		};
	},
	{ recordGoogleEvent, recordTracksEvent }
);

export default flowRight( connectComponent, localize )( SharingButtonsOptions );
