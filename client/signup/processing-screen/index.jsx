
/**
 * External dependencies
 */
var React = require( 'react' ),
	Button = require( 'components/button' ),
	Gridicon = require( 'components/gridicon' ),
	Notice = require( 'components/notice' );

module.exports = React.createClass( {
	displayName: 'SignupProcessingScreen',

	renderConfirmationNotice: function() {
		if ( this.props.user && this.props.user.email_verified ) {
			return;
		}

		let email = this.props.user && this.props.user.email;

		if ( !email ) {
			for ( let step of this.props.steps ) {
				if ( step.form && step.form.email && step.form.email.value ) {
					email = step.form.email.value;
				}
			}
		}

		if ( !email ) {
			return;
		}

		return (
			<Notice showDismiss={ false }>
				{ this.translate( 'We’ve sent a message to {{strong}}%(email)s{{/strong}}. Please use this time to confirm your email address.', { args: { email }, components: { strong: <strong /> } } ) }
			</Notice>
		);
	},

	renderFloaties: function() {
		// Non standard gridicon sizes are used here because we display giant, floating icons on the page with an animation
		/* eslint-disable wpcalypso/jsx-gridicon-size */
		return (
			<div className="signup-processing-screen__floaties">
				<Gridicon icon="add" size={ 64 } />
				<Gridicon icon="aside" size={ 64 } />
				<Gridicon icon="attachment" size={ 64 } />
				<Gridicon icon="audio" size={ 64 } />
				<Gridicon icon="bell" size={ 64 } />
				<Gridicon icon="book" size={ 64 } />
				<Gridicon icon="camera" size={ 64 } />
				<Gridicon icon="comment" size={ 64 } />
				<Gridicon icon="globe" size={ 64 } />
				<Gridicon icon="pencil" size={ 64 } />
				<Gridicon icon="phone" size={ 64 } />
				<Gridicon icon="reader" size={ 64 } />
				<Gridicon icon="star" size={ 64 } />
				<Gridicon icon="video" size={ 64 } />
				<Gridicon icon="align-image-right" size={ 64 } />
				<Gridicon icon="bookmark" size={ 64 } />
				<Gridicon icon="briefcase" size={ 64 } />
				<Gridicon icon="calendar" size={ 64 } />
				<Gridicon icon="clipboard" size={ 64 } />
				<Gridicon icon="cloud-upload" size={ 64 } />
				<Gridicon icon="cog" size={ 64 } />
				<Gridicon icon="customize" size={ 64 } />
				<Gridicon icon="help" size={ 64 } />
				<Gridicon icon="link" size={ 64 } />
				<Gridicon icon="lock" size={ 64 } />
				<Gridicon icon="pages" size={ 64 } />
				<Gridicon icon="share" size={ 64 } />
				<Gridicon icon="stats" size={ 64 } />
			</div>
		);
		/* eslint-enable wpcalypso/jsx-gridicon-size */
	},

	render: function() {
		return (
			<div>
				{ this.renderFloaties() }

				<div className="signup-processing__content">
					<svg className="signup-process-screen__wpcom-logo" width="500" height="501" viewBox="0 0 500 501" xmlns="http://www.w3.org/2000/svg"><path d="M363.003 445.26l68.65-198.493c12.828-32.067 17.096-57.706 17.096-80.506 0-8.274-.546-15.956-1.515-23.114 17.544 32.012 27.53 68.752 27.53 107.837 0 82.917-44.937 155.32-111.762 194.278zm-82.027-299.666c13.53-.71 25.723-2.135 25.723-2.135 12.11-1.432 10.684-19.234-1.43-18.522 0 0-36.408 2.856-59.91 2.856-22.088 0-59.2-2.856-59.2-2.856-12.12-.712-13.542 17.804-1.422 18.52 0 0 11.464 1.427 23.572 2.136l35.015 95.947-49.2 147.526-81.84-243.472c13.543-.71 25.722-2.135 25.722-2.135 12.108-1.432 10.676-19.234-1.438-18.522 0 0-36.4 2.856-59.903 2.856-4.215 0-9.19-.107-14.473-.275C102.39 66.504 171.47 26.21 249.997 26.21c58.517 0 111.797 22.37 151.783 59.014-.963-.064-1.912-.184-2.907-.184-22.082 0-37.747 19.233-37.747 39.896 0 18.52 10.685 34.19 22.08 52.715 8.545 14.97 18.528 34.2 18.528 61.985 0 19.25-5.706 43.453-17.103 72.67l-22.423 74.907-81.23-241.62zm-30.98 330.183c-22.06 0-43.358-3.244-63.493-9.157l67.446-195.977 69.08 189.29c.455 1.1 1.012 2.12 1.612 3.092-23.362 8.22-48.468 12.752-74.645 12.752zM25.233 250.983c0-32.592 6.99-63.53 19.465-91.48L151.915 453.27C76.925 416.84 25.232 339.954 25.232 250.983zM249.997.986C112.15.986 0 113.134 0 250.983 0 388.843 112.15 501 249.997 501 387.847 501 500 388.843 500 250.983 500 113.133 387.846.986 249.997.986z"/></svg>

					{ this.props.loginHandler
						?	<p className="signup-process-screen__title">{ this.translate( '{{strong}}Done!{{/strong}} Thanks for waiting, we’re ready for you to get started.', { components: { strong: <strong /> } } ) }</p>
						:	<p className="signup-process-screen__title">{ this.translate( '{{strong}}Awesome!{{/strong}} Give us one minute and we’ll move right along.', { components: { strong: <strong /> } } ) }</p>
					}

					{ this.props.loginHandler
						?	<Button primary className="email-confirmation__button" onClick={ this.props.loginHandler }>{ this.translate( 'Continue' ) }</Button>
						:	<Button primary disabled className="email-confirmation__button">{ this.translate( 'Please wait…' ) }</Button>
					}

					{ this.renderConfirmationNotice() }
				</div>
				<div className="signup-processing-screen__loader">{ this.translate( 'Loading…' ) }</div>
			</div>
		);
	}
} );
