/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import page from 'page';
import { find } from 'lodash';
import { stringify } from 'qs';

/**
 * Internal dependencies
 */
import { addQueryArgs } from 'lib/url';
import HeaderCake from 'components/header-cake';
import DocsSelectorsResult from './result';

export default class DocsSelectorsSingle extends Component {
	static propTypes = {
		selector: PropTypes.string.isRequired,
		search: PropTypes.string,
	};

	state = {};

	componentDidMount() {
		this.request( this.props.selector );
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.selector !== this.props.selector ) {
			this.request( this.props.selector );
		}
	}

	request = async ( selector ) => {
		const query = stringify( { search: selector } );

		try {
			const res = await fetch( `/devdocs/service/selectors?${ query }` );
			if ( res.ok ) {
				const results = await res.json();
				const result = find( results, { name: selector } );
				this.setState( { result } );
			}
		} catch ( error ) {
			// Do nothing.
		}
	};

	onReturnToSearch = () => {
		const { search } = this.props;

		let url = '/devdocs/selectors';
		if ( search ) {
			url = addQueryArgs( { search }, url );
		}

		page( url );
	};

	render() {
		const { selector } = this.props;
		const { result: { name, description, tags } = {} } = this.state;

		return (
			<div>
				<HeaderCake onClick={ this.onReturnToSearch }>{ selector }</HeaderCake>
				{ 'result' in this.state &&
					( this.state.result ? (
						<DocsSelectorsResult { ...{ name, description, tags } } expanded />
					) : (
						'No selector found'
					) ) }
			</div>
		);
	}
}
