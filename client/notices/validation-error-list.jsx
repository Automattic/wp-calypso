/**
 * External dependencies
 */
var React = require( 'react' ),
	map = require( 'lodash/map' );

module.exports = localize(class extends React.Component {
    static displayName = 'ValidationErrorList';

	static propTypes = {
		messages: React.PropTypes.array.isRequired
	};

	render() {
		return (
		    <div>
				<p>
					{ this.props.translate(
						'Please correct the issue below and try again.',
						'Please correct the issues listed below and try again.',
						{
							count: this.props.messages.length
						}
					) }
				</p>
				<ul>
					{ map( this.props.messages, function( message, index ) {
						return ( <li key={ index }>{ message }</li> );
					} ) }
				</ul>
			</div>
		);
	}
});
