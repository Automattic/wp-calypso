/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var Gridicon = require( 'components/gridicon' );

module.exports = React.createClass( {
	displayName: 'ChartTooltip',

	propTypes: {
		data: React.PropTypes.array.isRequired
	},

	render: function() {
		var listItemElements;

		listItemElements = this.props.data.map( function( options, i ) {
			var wrapperClasses = [ 'module-content-list-item' ],
				gridiconSpan;

			if ( options.icon ) {
				gridiconSpan = ( <Gridicon icon={ options.icon } size={ 18 } /> );
			}

			wrapperClasses.push( options.className );

			return (
				<li key={ i } className={ wrapperClasses.join( ' ' ) } >
					<span className='wrapper'>
						<span className='value'>{ options.value }</span>
						<span className='label'>{ gridiconSpan }{ options.label }</span>
					</span>
				</li>
			);
		} );

		return (
			<ul>
				{ listItemElements }
			</ul>
		);
	}
} );
