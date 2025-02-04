import page from '@automattic/calypso-router';
import { find } from 'lodash';
import PropTypes from 'prop-types';
import { stringify } from 'qs';
import { Component } from 'react';
import HeaderCake from 'calypso/components/header-cake';
import { addQueryArgs } from 'calypso/lib/url';
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
				const result = find( results, { item: { name: selector } } );
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
		const { result: { item: { name, description, tags } = {} } = {} } = this.state;

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
