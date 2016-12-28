/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { flowRight, get, partial, some, xor } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import MultiCheckbox from 'components/forms/multi-checkbox';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite, isJetpackMinimumVersion } from 'state/sites/selectors';
import { recordGoogleEvent } from 'state/analytics/actions';

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
		values: PropTypes.object,
	};

	static defaultProps = {
		values: Object.freeze( {} ),
		onChange: () => {},
		initialized: false,
		saving: false
	};

	getSanitizedTwitterUsername( username ) {
		return username ? '@' + username.replace( /\W/g, '' ).substr( 0, 15 ) : '';
	}

	trackTwitterViaAnalyticsEvent = () => {
		this.props.recordGoogleEvent( 'Sharing', 'Focussed Twitter Username Field' );
	};

	handleMultiCheckboxChange = ( name, event ) => {
		const delta = xor( this.props.values.sharing_show, event.value );
		this.props.onChange( name, event.value.length ? event.value : null );
		if ( delta.length ) {
			const checked = -1 !== event.value.indexOf( delta[ 0 ] );
			this.props.recordGoogleEvent( 'Sharing', 'Clicked Show Sharing Buttons On Page Checkbox', delta[ 0 ], checked ? 1 : 0 );
		}
	};

	handleTwitterViaChange = event => {
		this.props.onChange( event.target.name, this.getSanitizedTwitterUsername( event.target.value ) );
	};

	handleChange = event => {
		let value;
		if ( 'checkbox' === event.target.type ) {
			value = event.target.checked;
		} else {
			value = event.target.value;
		}

		if ( 'jetpack_comment_likes_enabled' === event.target.name ) {
			this.props.recordGoogleEvent(
				'Sharing', 'Clicked Comment Likes On For All Posts Checkbox', 'checked', event.target.checked ? 1 : 0
			);
		}

		this.props.onChange( event.target.name, value );
	};

	getPostTypeLabel( postType ) {
		let label;

		switch ( postType.name ) {
			case 'index':
				label = this.props.translate( 'Front Page, Archive Pages, and Search Results', { context: 'jetpack' } );
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
		return [
			{ name: 'index' }
		].concat( this.props.postTypes ).map( function( postType ) {
			return {
				value: postType.name,
				label: this.getPostTypeLabel( postType )
			};
		}, this );
	}

	isTwitterButtonEnabled() {
		return some( this.props.buttons, { ID: 'twitter', enabled: true } );
	}

	getTwitterViaOptionElement() {
		if ( ! this.isTwitterButtonEnabled() || ! this.props.isTwitterButtonAllowed ) {
			return;
		}

		const option = this.props.isJetpack ? 'jetpack-twitter-cards-site-tag' : 'twitter_via';

		return (
			<fieldset className="sharing-buttons__fieldset">
				<legend className="sharing-buttons__fieldset-heading">{ this.props.translate( 'Twitter username' ) }</legend>
				<input
					name={ option }
					type="text"
					placeholder={ '@' + this.props.translate( 'username', { textOnly: true } ) }
					value={ this.getSanitizedTwitterUsername( this.props.values[ option ] ) }
					onChange={ this.handleTwitterViaChange }
					onFocus={ this.trackTwitterViaAnalyticsEvent }
					disabled={ ! this.props.initialized } />
				<p className="sharing-buttons__fieldset-detail">
					{ this.props.translate( 'This will be included in tweets when people share using the Twitter button.' ) }
				</p>
			</fieldset>
		);
	}

	getCommentLikesOptionElement() {
		if ( this.props.isJetpack ) {
			return;
		}

		const checked = get( this.props.values, 'jetpack_comment_likes_enabled', false );

		return (
			<fieldset className="sharing-buttons__fieldset">
				<legend className="sharing-buttons__fieldset-heading">
					{ this.props.translate( 'Comment Likes', { context: 'Sharing options: Header' } ) }
				</legend>
				<label>
					<input name="jetpack_comment_likes_enabled"
						type="checkbox"
						checked={ checked }
						onChange={ this.handleChange }
						disabled={ ! this.props.initialized }
					/>
					<span>{ this.props.translate( 'On for all posts', { context: 'Sharing options: Comment Likes' } ) }</span>
				</label>
			</fieldset>
		);
	}

	render() {
		const changeSharingPostTypes = partial( this.handleMultiCheckboxChange, 'sharing_show' );

		return (
			<div className="sharing-buttons__panel">
				<h4>{ this.props.translate( 'Options' ) }</h4>
				<div className="sharing-buttons__fieldset-group">
					<fieldset className="sharing-buttons__fieldset">
						<legend className="sharing-buttons__fieldset-heading">
							{ this.props.translate( 'Show sharing buttons on', {
								context: 'Sharing options: Header',
								comment: 'Possible values are: "Front page, Archive Pages, and Search Results", "Posts", "Pages", "Media"'
							} ) }
						</legend>
						<MultiCheckbox
							name="sharing_show"
							options={ this.getDisplayOptions() }
							checked={ this.props.values.sharing_show }
							onChange={ changeSharingPostTypes }
							disabled={ ! this.props.initialized }
						/>
					</fieldset>
					{ this.getCommentLikesOptionElement() }
					{ this.getTwitterViaOptionElement() }
				</div>

				<button
					type="submit"
					className="button is-primary sharing-buttons__submit"
					disabled={ this.props.saving || ! this.props.initialized }
				>
					{ this.props.saving ? this.props.translate( 'Saving…' ) : this.props.translate( 'Save Changes' ) }
				</button>
			</div>
		);
	}
}

const connectComponent = connect(
	state => {
		const siteId = getSelectedSiteId( state );
		const isJetpack = isJetpackSite( state, siteId );
		const isTwitterButtonAllowed = ! isJetpack || isJetpackMinimumVersion( state, siteId, '3.4-dev' );

		return {
			isJetpack,
			isTwitterButtonAllowed
		};
	},
	{ recordGoogleEvent }
);

export default flowRight(
	connectComponent,
	localize
)( SharingButtonsOptions );
