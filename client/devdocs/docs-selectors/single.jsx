/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import page from 'page';
import request from 'superagent';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import { addQueryArgs } from 'lib/url';
import HeaderCake from 'components/header-cake';
import DocsSelectorsResult from './result';

export default class DocsSelectorsSingle extends Component {
	static propTypes = {
		selector: PropTypes.string.isRequired,
		search: PropTypes.string
	};

	state = {};

	componentWillMount() {
		this.request( this.props.selector );
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.selector !== this.props.selector ) {
			this.request( nextProps.selector );
		}
	}

	request = ( selector ) => {
		request.get( '/devdocs/service/selectors' )
			.query( { search: selector } )
			.then( ( { body } ) => {
				const result = find( body, { name: selector } );
				this.setState( { result } );
			} );
	}

	onReturnToSearch = () => {
		const { search } = this.props;

		let url = '/devdocs/selectors';
		if ( search ) {
			url = addQueryArgs( { search }, url );
		}

		page( url );
	}

	render() {
		const { selector } = this.props;
		const { result: { name, description, tags } = {} } = this.state;

		return (
			<div>
				<HeaderCake onClick={ this.onReturnToSearch }>
					{ selector }
				</HeaderCake>
				{ 'result' in this.state && (
					this.state.result
						? <DocsSelectorsResult
							{ ...{ name, description, tags } }
							expanded />
						: 'No selector found'
				) }
			</div>
		);
	}
}
