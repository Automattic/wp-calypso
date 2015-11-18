/**
 * External dependencies
 */
 var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:me:profile' );

/**
 * Internal dependencies
 */

 var ProfileLinksAddWordPress = require( 'me/profile-links-add-wordpress' ),
  ProfileLinksAddOther = require( 'me/profile-links-add-other' ),
  Card = require( 'components/card' );


module.exports = React.createClass( {

  displayName: 'ProfileLinksCreators',

  getDefaultProps: function() {
    return{
      showingForm: false
    };
  },

  render: function() {
    return(
      <div>
        {
          'wordpress' === this.props.showingForm
          ? (
            <ProfileLinksAddWordPress
              userProfileLinks={ this.props.userProfileLinks }
              onSuccess={ this.props.hideForms }
              onCancel={ this.props.hideForms }
            />
          )
          : null
        }

        {
          'other' === this.props.showingForm
          ? (
            <ProfileLinksAddOther
              userProfileLinks={ this.props.userProfileLinks }
              onSuccess={ this.props.hideForms }
              onCancel={ this.props.hideForms }
            />
          )
          : null
        }
        </div>
    );
  }
} );
