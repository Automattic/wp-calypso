/**
 * External dependencies
 */
var React = require( 'react' );

// Internal dependencies
var Button = require( 'components/button' ),
	observe = require( 'lib/mixins/data-observe' ),
	eventRecorder = require( 'me/event-recorder' ),
	Gridicon = require( 'components/gridicon' );

module.exports = React.createClass( {

	displayName: 'AddProfileLinksButtons',

	mixins: [ observe( 'userProfileLinks' ), eventRecorder ],

	propTypes: {
		showingForm: React.PropTypes.bool
	},

	getDefaultProps: function() {
		return{
			showingForm: false
		};
	},

	render: function() {
		return(
			<div>
				<Button
					compact
					disabled={ this.props.showingForm }
					onClick={ this.recordClickEvent( 'Add Other Site Button', this.props.onShowAddOther ) }
				>
					<Gridicon icon="plus-small" size={ 12 } />
					{ this.translate( 'Add URL' ) }
				</Button>

				<Button
					compact
					disabled={ this.props.showingForm }
					primary
					className="add-buttons__add-wp-site"
					onClick={ this.recordClickEvent( 'Add a WordPress Site Button', this.props.onShowAddWordPress ) }
				>
					<Gridicon icon="plus-small" size={ 12 } />
					{ this.translate( 'Add WordPress Site' ) }
				</Button>
			</div>
		);
	}
} );
