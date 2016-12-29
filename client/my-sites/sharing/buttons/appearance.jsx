/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { flowRight, partial } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ButtonsPreview from './preview';
import ButtonsPreviewPlaceholder from './preview-placeholder';
import ButtonsStyle from './style';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite, isJetpackModuleActive } from 'state/sites/selectors';
import { isPrivateSite } from 'state/selectors';
import { recordGoogleEvent } from 'state/analytics/actions';

class SharingButtonsAppearance extends Component {
	static propTypes = {
		buttons: PropTypes.array,
		initialized: PropTypes.bool,
		isJetpack: PropTypes.bool,
		isLikesModuleActive: PropTypes.bool,
		isPrivate: PropTypes.bool,
		onChange: PropTypes.func,
		onButtonsChange: PropTypes.func,
		onButtonsSave: PropTypes.func,
		recordGoogleEvent: PropTypes.func,
		saving: PropTypes.bool,
		values: PropTypes.object,
	}

	static defaultProps = {
		buttons: Object.freeze( [] ),
		values: Object.freeze( {} ),
		onChange: () => {},
		onButtonsChange: () => {},
		initialized: false,
		saving: false
	};

	isLikeButtonEnabled() {
		return '' === this.props.values.disabled_likes || false === this.props.values.disabled_likes;
	}

	isReblogButtonEnabled() {
		return '' === this.props.values.disabled_reblogs || false === this.props.values.disabled_reblogs;
	}

	onReblogsLikesCheckboxClicked = event => {
		this.props.onChange( event.target.name, ! event.target.checked );
		if ( 'disabled_reblogs' === event.target.name ) {
			this.props.recordGoogleEvent( 'Sharing', 'Clicked Show Reblog Button Checkbox', 'checked', event.target.checked ? 1 : 0 );
		} else if ( 'disabled_likes' === event.target.name ) {
			this.props.recordGoogleEvent( 'Sharing', 'Clicked Show Like Button Checkbox', 'checked', event.target.checked ? 1 : 0 );
		}
	};

	getPreviewElement() {
		if ( this.props.initialized ) {
			const changeLabel = partial( this.props.onChange, 'sharing_label' );

			return (
				<ButtonsPreview
					isPrivateSite={ this.props.isPrivate }
					style={ this.props.values.sharing_button_style }
					label={ this.props.values.sharing_label }
					buttons={ this.props.buttons }
					showLike={
						( ! this.props.isJetpack || this.props.isLikesModuleActive ) &&
						this.isLikeButtonEnabled()
					}
					showReblog={ ! this.props.isJetpack && this.isReblogButtonEnabled() }
					onLabelChange={ changeLabel }
					onButtonsChange={ this.props.onButtonsChange } />
			);
		}

		return <ButtonsPreviewPlaceholder />;
	}

	getReblogOptionElement() {
		if ( ! this.props.isJetpack ) {
			return (
				<label>
					<input
						name="disabled_reblogs"
						type="checkbox"
						checked={ this.isReblogButtonEnabled() }
						onChange={ this.onReblogsLikesCheckboxClicked }
						disabled={ ! this.props.initialized }
					/>
					<span>{ this.props.translate( 'Show reblog button', { context: 'Sharing options: Checkbox label' } ) }</span>
				</label>
			);
		}
	}

	getReblogLikeOptionsElement() {
		if ( ( ! this.props.isJetpack || this.props.isLikesModuleActive ) ) {
			return (
				<fieldset className="sharing-buttons__fieldset">
					<legend className="sharing-buttons__fieldset-heading">
						{ this.props.translate( 'Reblog & Like', { context: 'Sharing options: Header' } ) }
					</legend>
					{ this.getReblogOptionElement() }
					<label>
						<input
							name="disabled_likes"
							type="checkbox"
							checked={ this.isLikeButtonEnabled() }
							onChange={ this.onReblogsLikesCheckboxClicked }
							disabled={ ! this.props.initialized }
						/>
						<span>{ this.props.translate( 'Show like button', { context: 'Sharing options: Checkbox label' } ) }</span>
					</label>
				</fieldset>
			);
		}
	}

	render() {
		const changeButtonStyle = partial( this.props.onChange, 'sharing_button_style' );
		return (
			<div className="sharing-buttons__panel sharing-buttons-appearance">
				<p className="sharing-buttons-appearance__description">
					{ this.props.translate(
						'Allow readers to easily share your posts with others by adding sharing buttons throughout your site.'
					) }
				</p>

				{ this.getPreviewElement() }

				<div className="sharing-buttons__fieldset-group">
					<ButtonsStyle
						onChange={ changeButtonStyle }
						value={ this.props.values.sharing_button_style }
						disabled={ ! this.props.initialized }
					/>
					{ this.getReblogLikeOptionsElement() }
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
		const isLikesModuleActive = isJetpackModuleActive( state, siteId, 'likes' );
		const isPrivate = isPrivateSite( state, siteId );

		return {
			isJetpack,
			isLikesModuleActive,
			isPrivate,
		};
	},
	{ recordGoogleEvent }
);

export default flowRight(
	connectComponent,
	localize,
)( SharingButtonsAppearance );
