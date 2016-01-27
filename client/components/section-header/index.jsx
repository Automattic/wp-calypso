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
			label: '',
			compactLabel: false
		};
	},

	render: function() {
		const classes = classNames(
			this.props.className,
			'section-header',
			{
				'header-is-compact': this.props.compactLabel
			}
		);

		return (
			<CompactCard className={ classes }>
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
