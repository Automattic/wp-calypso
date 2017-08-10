/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:me:security:2fa-progress' ),
	ProgressItem = require( './progress-item' );

module.exports = localize(class extends React.Component {
    static displayName = 'Security2faProgress';

	componentDidMount() {
		debug( this.constructor.displayName + ' React component is mounted.' );
	}

	componentWillUnmount() {
		debug( this.constructor.displayName + ' React component will unmount.' );
	}

	stepClass = step => {
		var currentStep = parseInt( this.props.step, 10 );

		return ( {
			isHighlighted: step === currentStep,
			isCompleted: step < currentStep
		} );
	};

	render() {
		return (
		    <div className="security-2fa-progress__container">

				<div className="security-2fa-progress__inner-container">

					<ProgressItem
						label={ this.props.translate( 'Enter Phone Number' ) }
						icon="phone"
						step={ this.stepClass( 1 ) }
					/>

					<ProgressItem
						label={ this.props.translate( 'Verify Code' ) }
						icon="send-to-phone"
						step={ this.stepClass( 2 ) }
					/>

					<ProgressItem
						label={ this.props.translate( 'Generate Backup Codes' ) }
						icon="refresh"
						step={ this.stepClass( 3 ) }
					/>

				</div>

			</div>
		);
	}
});
