/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var CompactCard = require( 'components/card/compact' ),
	Count = require( 'components/count' );

var PeopleSectionHeader = React.createClass( {
	getDefaultProps: function() {
		return {
			label: ''
		};
	},

	render: function() {
		return (
			<CompactCard className={ classNames( this.props.className, 'section-header' ) }>
				<div className="section-header__label">
					{ this.props.label }
					{
						'number' === typeof this.props.count &&
						<Count count={ this.props.count } />
					}
				</div>
				<div className="section-header__actions">
					{ this.props.children }
				</div>
			</CompactCard>
		);
	}
} );

module.exports = PeopleSectionHeader;
