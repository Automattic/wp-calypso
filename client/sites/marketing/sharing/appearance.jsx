import { FormLabel } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import SupportInfo from 'calypso/components/support-info';
import { PanelSection } from 'calypso/sites/components/panel';
import { recordGoogleEvent, recordTracksEvent } from 'calypso/state/analytics/actions';
import getCurrentRouteParameterized from 'calypso/state/selectors/get-current-route-parameterized';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import ButtonsPreview from './preview';
import ButtonsPreviewPlaceholder from './preview-placeholder';
import ButtonsStyle from './style';

class SharingButtonsAppearance extends Component {
	static propTypes = {
		buttons: PropTypes.array,
		initialized: PropTypes.bool,
		isJetpack: PropTypes.bool,
		isPrivate: PropTypes.bool,
		onChange: PropTypes.func,
		onButtonsChange: PropTypes.func,
		onButtonsSave: PropTypes.func,
		recordGoogleEvent: PropTypes.func,
		saving: PropTypes.bool,
		values: PropTypes.object,
	};

	static defaultProps = {
		buttons: Object.freeze( [] ),
		values: Object.freeze( {} ),
		onChange: () => {},
		onButtonsChange: () => {},
		initialized: false,
		saving: false,
	};

	isLikeButtonEnabled() {
		return '' === this.props.values.disabled_likes || false === this.props.values.disabled_likes;
	}

	isReblogButtonEnabled() {
		return (
			'' === this.props.values.disabled_reblogs || false === this.props.values.disabled_reblogs
		);
	}

	onReblogsLikesCheckboxClicked = ( event ) => {
		this.props.onChange( event.target.name, ! event.target.checked );

		const { path } = this.props;
		const checked = event.target.checked ? 1 : 0;

		if ( 'disabled_reblogs' === event.target.name ) {
			this.props.recordTracksEvent( 'calypso_sharing_buttons_show_reblog_checkbox_click', {
				checked,
				path,
			} );
			this.props.recordGoogleEvent(
				'Sharing',
				'Clicked Show Reblog Button Checkbox',
				'checked',
				checked
			);
		} else if ( 'disabled_likes' === event.target.name ) {
			this.props.recordTracksEvent( 'calypso_sharing_buttons_show_like_checkbox_click', {
				checked,
				path,
			} );
			this.props.recordGoogleEvent(
				'Sharing',
				'Clicked Show Like Button Checkbox',
				'checked',
				checked
			);
		}
	};

	getPreviewElement() {
		if ( this.props.initialized ) {
			return (
				<ButtonsPreview
					isPrivateSite={ this.props.isPrivate }
					style={ this.props.values.sharing_button_style }
					label={ this.props.values.sharing_label }
					buttons={ this.props.buttons }
					showLike={ this.isLikeButtonEnabled() }
					showReblog={ ! this.props.isJetpack && this.isReblogButtonEnabled() }
					onLabelChange={ ( value ) => this.props.onChange( 'sharing_label', value ) }
					onButtonsChange={ this.props.onButtonsChange }
				/>
			);
		}

		return <ButtonsPreviewPlaceholder />;
	}

	getReblogOptionElement() {
		if ( ! this.props.isJetpack ) {
			return (
				<FormLabel>
					<FormInputCheckbox
						name="disabled_reblogs"
						checked={ this.isReblogButtonEnabled() }
						onChange={ this.onReblogsLikesCheckboxClicked }
						disabled={ ! this.props.initialized }
					/>
					<span>
						{ this.props.translate( 'Show reblog button', {
							context: 'Sharing options: Checkbox label',
						} ) }
					</span>
				</FormLabel>
			);
		}
	}

	getReblogLikeOptionsElement() {
		const { isJetpack, translate } = this.props;

		return (
			<FormFieldset className="buttons__fieldset sharing-buttons__fieldset">
				<legend className="buttons__fieldset-heading sharing-buttons__fieldset-heading">
					{ isJetpack
						? translate( 'Like', { context: 'Sharing options: Header' } )
						: translate( 'Reblog & Like', { context: 'Sharing options: Header' } ) }
				</legend>
				{ this.getReblogOptionElement() }
				<FormLabel>
					<FormInputCheckbox
						name="disabled_likes"
						checked={ this.isLikeButtonEnabled() }
						onChange={ this.onReblogsLikesCheckboxClicked }
						disabled={ ! this.props.initialized }
					/>
					<span>
						{ translate( 'Show like button', { context: 'Sharing options: Checkbox label' } ) }
					</span>
					<SupportInfo
						text={ translate(
							'Give your readers the ability to show appreciation for your posts.'
						) }
						link={ localizeUrl( 'https://wordpress.com/support/likes/' ) }
						privacyLink={ false }
						position="bottom left"
					/>
				</FormLabel>
			</FormFieldset>
		);
	}

	render() {
		// Disable classname namespace because `sharing-buttons` makes the most sense here
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<PanelSection className="sharing-buttons-appearance">
				<p className="sharing-buttons-appearance__description">
					{ this.props.translate(
						'Allow readers to easily share your posts with others by adding sharing buttons throughout your site.'
					) }
				</p>

				{ this.getPreviewElement() }

				<div className="sharing-buttons__fieldset-group">
					<ButtonsStyle
						onChange={ ( value ) => this.props.onChange( 'sharing_button_style', value ) }
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
					{ this.props.saving
						? this.props.translate( 'Saving…' )
						: this.props.translate( 'Save changes' ) }
				</button>
			</PanelSection>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

const connectComponent = connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const isJetpack = isJetpackSite( state, siteId );
		const isPrivate = isPrivateSite( state, siteId );

		return {
			isJetpack,
			isPrivate,
			path: getCurrentRouteParameterized( state, siteId ),
		};
	},
	{ recordGoogleEvent, recordTracksEvent }
);

export default connectComponent( localize( SharingButtonsAppearance ) );
