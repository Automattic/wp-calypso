/**
 * External dependencies
 */
import { find } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import request from 'superagent';

/**
 * Internal dependencies
 */
import DocsSelectorsResult from './result';
import HeaderCake from 'components/header-cake';
import { addQueryArgs } from 'lib/url';

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
