/**
 * External Dependencies
 */
import React, { Component, PropTypes } from 'react';
import request from 'superagent';
import Remarkable from 'remarkable';
import RemarkableReactRenderer from 'remarkable-react';

/**
 * Internal Dependencies
 */
import Spinner from 'components/spinner';
import Card from 'components/card';
import Ribbon from 'components/ribbon';

class Readme extends Component {
	constructor( props ) {
		super( props );

		this.md = new Remarkable( {
			linkify: true, // auto-convert things that look like links to <a> components
			typographer: true // prettify quotes in the content
		} );
		this.md.renderer = new RemarkableReactRenderer();
	}

	componentWillMount() {
		this.requestReadme( this.props.component );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.component !== nextProps.component ) {
			this.requestReadme( this.props.component );
		}
	}

	requestReadme = ( component ) => {
		this.setState( {
			loading: true
		} );
		request.get( '/devdocs/service/content' )
			.query( { component } )
			.then( ( { text } ) => {
				this.setState( {
					loading: false,
					readmeHtml: text
				} );
			} )
			.catch( ( err ) => {
				this.setState( {
					loading: false,
					error: err
				} );
			} );
	};

	render() {
		if ( this.state.loading ) {
			return (
				<div className="docs-example__readme-content">
					<hr />
					<Card>
						<div className="docs-example__readme-loading-message">
							Loading readme, please wait
						</div>
						<Spinner className="docs-example__readme-spinner" size={ 50 } />
					</Card>
				</div>
			);
		}

		if ( this.state.error ) {
			return (
				<div className="docs-example__readme-content">
					<hr />
					<Card>
						<p>An error has occurred loading the readme! The server
							responded: { `${ this.state.error }` }</p>
						<p>
							Reasons that you may be seeing this error:
						</p>
						<ul>
							<li>Check that { `${ this.props.component }` }/README.md exists</li>
							<li>Ensure the server is running</li>
						</ul>
					</Card>
				</div>
			);
		}

		return (
			<div className="docs-example__readme-content">
				<hr />
				<Card>
					<Ribbon>README.md</Ribbon>
					{ this.md.render( this.state.readmeHtml ) }
				</Card>
			</div>
		);
	}
}

Readme.propTypes = {
	component: PropTypes.string.isRequired
};

export default Readme;
