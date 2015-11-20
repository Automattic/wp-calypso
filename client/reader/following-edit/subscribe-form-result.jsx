//const debug = require( 'debug' )( 'calypso:reader:following:edit' );

// External dependencies
const React = require( 'react' ),
	classNames = require( 'classnames' );

// Internal dependencies
const ListItem = require( 'reader/list-item' ),
	Icon = require( 'reader/list-item/icon' ),
	Title = require( 'reader/list-item/title' ),
	Description = require( 'reader/list-item/description' ),
	Actions = require( 'reader/list-item/actions' ),
	FollowButton = require( 'components/follow-button/button' ),
	SiteIcon = require( 'components/site-icon' );

var FollowingEditSubscribeFormResult = React.createClass( {

	propTypes: {
		url: React.PropTypes.string.isRequired,
		isValid: React.PropTypes.bool.isRequired,
		onFollowToggle: React.PropTypes.func.isRequired
	},

	render: function() {
		const message = ! this.props.isValid ?
			this.translate( 'Not a valid URL' ) :
			this.translate( 'Click Follow to follow this URL' );
		const classes = classNames( 'is-search-result', { 'is-valid': this.props.isValid } );

		return (
			<ListItem className={ classes }>
				<Icon><SiteIcon size={ 48 } /></Icon>
				<Title>{ this.props.url }</Title>
				<Description>{ message }</Description>
				<Actions>
					<FollowButton following={ false } onFollowToggle={ this.props.onFollowToggle } />
				</Actions>
			</ListItem>
			);
	}

} );

module.exports = FollowingEditSubscribeFormResult;
