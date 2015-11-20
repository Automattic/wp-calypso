/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var ButtonsPreview = require( './preview' ),
	ButtonsPreviewPlaceholder = require( './preview-placeholder' ),
	ButtonsStyle = require( './style' ),
	analytics = require( 'analytics' );

module.exports = React.createClass( {
	displayName: 'SharingButtonsAppearance',

	propTypes: {
		site: React.PropTypes.object.isRequired,
		buttons: React.PropTypes.array,
		values: React.PropTypes.object,
		onChange: React.PropTypes.func,
		onButtonsChange: React.PropTypes.func,
		onButtonsSave: React.PropTypes.func,
		initialized: React.PropTypes.bool,
		saving: React.PropTypes.bool
	},

	getDefaultProps: function() {
		return {
			buttons: Object.freeze( [] ),
			values: Object.freeze( {} ),
			onChange: function() {},
			onButtonsChange: function() {},
			initialized: false,
			saving: false
		};
	},

	onReblogsLikesCheckboxClicked: function( event ) {
		this.props.onChange( event.target.name, ! event.target.checked );

		if ( 'disabled_reblogs' === event.target.name ) {
			analytics.ga.recordEvent( 'Sharing', 'Clicked Show Reblog Button Checkbox', 'checked', event.target.checked ? 1 : 0 );
		} else if ( 'disabled_likes' === event.target.name ) {
			analytics.ga.recordEvent( 'Sharing', 'Clicked Show Like Button Checkbox', 'checked', event.target.checked ? 1 : 0 );
		}
	},

	getPreviewElement: function() {
		if ( this.props.initialized ) {
			return (
				<ButtonsPreview
					site={ this.props.site }
					style={ this.props.values.sharing_button_style }
					label={ this.props.values.sharing_label }
					buttons={ this.props.buttons }
					showLike={ ( ! this.props.site.jetpack || this.props.site.isModuleActive( 'likes' ) ) && ( '' === this.props.values.disabled_likes || false === this.props.values.disabled_likes ) }
					showReblog={ ! this.props.site.jetpack && ( '' === this.props.values.disabled_reblogs || false === this.props.values.disabled_reblogs ) }
					onLabelChange={ this.props.onChange.bind( null, 'sharing_label' ) }
					onButtonsChange={ this.props.onButtonsChange } />
			);
		} else {
			return <ButtonsPreviewPlaceholder />;
		}
	},

	getReblogOptionElement: function() {
		if ( ! this.props.site.jetpack ) {
			return (
				<label>
					<input name="disabled_reblogs" type="checkbox" checked={ '' === this.props.values.disabled_reblogs || false === this.props.values.disabled_reblogs } onChange={ this.onReblogsLikesCheckboxClicked } disabled={ ! this.props.initialized } />
					<span>{ this.translate( 'Show reblog button', { context: 'Sharing options: Checkbox label' } ) }</span>
				</label>
			);
		}
	},

	getReblogLikeOptionsElement: function() {
		if ( ! this.props.site.jetpack || this.props.site.isModuleActive( 'likes' ) ) {
			return (
				<fieldset className="sharing-buttons__fieldset">
					<legend className="sharing-buttons__fieldset-heading">
						{ this.translate( 'Reblog & Like', { context: 'Sharing options: Header' } ) }
					</legend>
					{ this.getReblogOptionElement() }
					<label>
						<input name="disabled_likes" type="checkbox" checked={ '' === this.props.values.disabled_likes || false === this.props.values.disabled_likes } onChange={ this.onReblogsLikesCheckboxClicked } disabled={ ! this.props.initialized } />
						<span>{ this.translate( 'Show like button', { context: 'Sharing options: Checkbox label' } ) }</span>
					</label>
				</fieldset>
			);
		}
	},

	render: function() {
		return (
			<div className="sharing-buttons__panel sharing-buttons-appearance">
				<p className="sharing-buttons-appearance__description">
					{ this.translate( 'Allow readers to easily share your posts with others by adding sharing buttons throughout your site.' ) }
				</p>

				{ this.getPreviewElement() }

				<div className="sharing-buttons__fieldset-group">
					<ButtonsStyle onChange={ this.props.onChange.bind( null, 'sharing_button_style' ) } value={ this.props.values.sharing_button_style } disabled={ ! this.props.initialized } />
					{ this.getReblogLikeOptionsElement() }
				</div>

				<button type="submit" className="button is-primary sharing-buttons__submit" disabled={ this.props.saving || ! this.props.initialized }>
					{ this.props.saving ? this.translate( 'Saving…' ) : this.translate( 'Save Changes' ) }
				</button>
			</div>
		);
	}
} );
