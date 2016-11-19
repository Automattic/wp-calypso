/** External Dependencies */
import React, { Component, PropTypes } from 'react';
import request from 'superagent';
import ReactMarkdown from 'react-markdown';

/** Internal Dependencies */
import Spinner from 'components/spinner';

class Readme extends Component {
	constructor( props ) {
		super( props );
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
					readmeHtml: (
						<ReactMarkdown source={ text } escapeHtml={ true } />
					)
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
				<div>
					<hr />
					<div className="docs-example__readme_loading_message">
						Loading readme, please wait
					</div>
					<Spinner className="docs-example__readme_spinner" size={ 50 } />
				</div>
			);
		}

		if ( this.state.error ) {
			return (
				<div>
					An error has occurred loading the readme!
				</div>
			);
		}

		return (
			this.state.readmeHtml
		);
	}
}

Readme.propTypes = {
	component: PropTypes.string.isRequired
};

export default Readme;
