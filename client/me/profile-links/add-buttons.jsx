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
    userProfileLinks: false
  },

  getInitialState: function() {
    return {
      showingForm: false,
      lastError: false
    };
  },

  showAddWordPress: function( event ) {
    event.preventDefault();
    this.setState( { showingForm: 'wordpress' } );
  },

  showAddOther: function( event ) {
    event.preventDefault();
    this.setState( { showingForm: 'other' } );
  },

  hideForms: function() {
    this.setState( { showingForm: false } );
  },

  renderFormVisibilityControls: function() {
    return (
      <div>

        <Button compact onClick={ this.recordClickEvent( 'Add Other Site Button', this.showAddOther ) } >
          <Gridicon icon="plus-small" size={ 12 } />
          { this.translate( 'Add URL' ) }
        </Button>

        <Button className="add-buttons__add-wp-site" compact primary onClick={ this.recordClickEvent( 'Add a WordPress Site Button', this.showAddWordPress ) } >
          <Gridicon icon="plus-small" size={ 12 } />
          { this.translate( 'Add WordPress Site' ) }
        </Button>
      </div>
    );
  },

  render: function() {
    return(
      <div>
        {
          'wordpress' === this.state.showingForm
          ? (
            <ProfileLinksAddWordPress
              userProfileLinks={ this.props.userProfileLinks }
              onSuccess={ this.hideForms }
              onCancel={ this.hideForms }
            />
          )
          : null
        }

        {
          'other' === this.state.showingForm
          ? (
            <ProfileLinksAddOther
              userProfileLinks={ this.props.userProfileLinks }
              onSuccess={ this.hideForms }
              onCancel={ this.hideForms }
            />
          )
          : null
        }

        { ! this.state.showingForm ? this.renderFormVisibilityControls() : null }
      </div>
    );
  }

} );
