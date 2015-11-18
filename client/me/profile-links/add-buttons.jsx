/**
 * External dependencies
 */
var React = require( 'react' );

// internal dependencies
var Button = require( 'components/button' ),
  ProfileLinksAddWordPress = require( 'me/profile-links-add-wordpress' ),
  ProfileLinksAddOther = require( 'me/profile-links-add-other' ),
  observe = require( 'lib/mixins/data-observe' ),
  eventRecorder = require( 'me/event-recorder' ),
  Gridicon = require( 'components/gridicon' );

module.exports = React.createClass( {

  displayName: 'AddProfileLinksButtons',

  mixins: [ observe( 'userProfileLinks' ), eventRecorder ],

  getDefaultProps: function() {
    return{
      showingForm: false
    };
  },

  renderButtons: function() {
    return(
      <div>
        <Button compact onClick={ this.recordClickEvent( 'Add Other Site Button', this.props.onShowAddOther ) } >
          <Gridicon icon="plus-small" size={ 12 } />
          { this.translate( 'Add URL' ) }
        </Button>

        <Button className="add-buttons__add-wp-site" compact primary onClick={ this.recordClickEvent( 'Add a WordPress Site Button', this.props.onShowAddWordPress ) } >
          <Gridicon icon="plus-small" size={ 12 } />
          { this.translate( 'Add WordPress Site' ) }
        </Button>
      </div>
    );
  },

  render: function() {
    return(
      <div>
        { ! this.props.showingForm
          ? this.renderButtons()
          : null
        }
      </div>
    );
  }
} );
