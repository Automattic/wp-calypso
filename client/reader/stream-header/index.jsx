var React = require( 'react' ),
	classnames = require( 'classnames' );

var Card = require( 'components/card' ),
	FollowButton = require( 'components/follow-button/button' ),
	Gridicon = require( 'components/gridicon' ),
	isExternal = require( 'lib/url' ).isExternal;

var StreamHeader = React.createClass( {
	propTypes: {
		isPlaceholder: React.PropTypes.bool,
		title: React.PropTypes.string,
		description: React.PropTypes.string,
		showFollow: React.PropTypes.bool,
		showEdit: React.PropTypes.bool,
		editUrl: React.PropTypes.string,
		following: React.PropTypes.bool,
		onFollowToggle: React.PropTypes.func
	},

	render: function() {
		var classes = classnames( {
			'stream-header': true,
			'is-placeholder': this.props.isPlaceholder,
			'has-icon': this.props.icon,
			'has-description': this.props.description
		} );

		return (
			<Card className={ classes }>
				{ this.props.icon ?
				<span className="stream-header__icon">
					{ this.props.icon }
				</span> : null }

				<h1 className="stream-header__title">{ this.props.title }</h1>
				{ this.props.description ? <p className="stream-header__description">{ this.props.description }</p> : null }

				{ this.props.showFollow ?
					<div className="stream-header__follow">
						<FollowButton iconSize={ 24 } following={ this.props.following } onFollowToggle={ this.props.onFollowToggle } />
				</div> : null }

				{ this.props.showEdit && this.props.editUrl ?
				<div className="stream-header__edit">
					<a href={ this.props.editUrl } rel={ isExternal( this.props.editUrl ) ? 'external' : '' }>
						<span className="stream-header__action-icon"><Gridicon icon="cog" size={ 24 } /></span>
						<span className="stream-header__action-label">{ this.translate( 'Edit' ) }</span>
					</a>
				</div> : null }
			</Card>
		);
	}

} );

module.exports = StreamHeader;
