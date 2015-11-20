/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var ActionRemove = require( 'me/action-remove' ),
	eventRecorder = require( 'me/event-recorder' );

module.exports = React.createClass( {

	displayName: 'ProfileLink',

	mixins: [ eventRecorder ],

	getDefaultProps: function() {
		return {
			imageSize: 100,
			title: '',
			url: '',
			slug: '',
			isPlaceholder: false
		};
	},

	propTypes: {
		imageSize: React.PropTypes.number,
		title: React.PropTypes.string.isRequired,
		url: React.PropTypes.string.isRequired,
		slug: React.PropTypes.string.isRequired
	},

	renderRemove: function() {
		return (
			<ActionRemove
				className="profile-link__remove"
				onClick={ this.recordClickEvent( 'Remove Link Next to Site', this.props.onRemoveLink ) }
			/>
		);
	},

	render: function() {
		var classes = classNames( {
				'profile-link': true,
				'is-placeholder': this.props.isPlaceholder
			} ),
			imageSrc = '//s1.wp.com/mshots/v1/' + encodeURIComponent( this.props.url ) + '?w=' + this.props.imageSize,
			linkHref = this.props.isPlaceholder ? null : this.props.url;

		return (
			<li className={ classes }>
				{
					this.props.isPlaceholder
					? <div className="profile-link__image" />
					: <img className="profile-link__image" src={ imageSrc } />
				}
				<a href={ linkHref } target="_blank" onClick={ this.recordClickEvent( 'Profile Links Site Link' ) }>
					<span className="profile-link__title">
						{ this.props.title }
					</span>
					<span className="profile-link__url">
						{ this.props.url }
					</span>
				</a>

				{ this.props.isPlaceholder ? null : this.renderRemove() }
			</li>
		);
	}
} );
