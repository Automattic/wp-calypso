/**
 * External Dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import debounce from 'lodash/debounce';

/**
 * Internal Dependencies
 */
import Stream from 'reader/stream';
import EmptyContent from './empty';
import StreamHeader from 'reader/stream-header';
import HeaderBack from 'reader/header-back';
import Gridicon from 'components/gridicon';
import FormTextInput from 'components/forms/form-text-input';

//const stats = require( 'reader/stats' );

const emptyStore = {
	get() {
		return [];
	},
	isLastPage() {
		return true;
	},
	getUpdateCount() {
		return 0;
	},
	getSelectedIndex() {
		return -1;
	},
	on() {},
	off() {}
};

const FeedStream = React.createClass( {

	propTypes: {
		query: React.PropTypes.string
	},

	getInitialState() {
		return {
			title: this.getTitle()
		};
	},

	componentWillMount() {
		this.debouncedUpdate = debounce( this.updateQuery, 300 );
	},

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.query !== this.props.query ) {
			this.updateState( nextProps );
		}
	},

	updateState( props = this.props ) {
		var newState = {
			title: this.getTitle( props )
		};
		if ( newState.title !== this.state.title ) {
			this.setState( newState );
		}
	},

	getTitle( props = this.props ) {
		return props.query;
	},

	updateQuery() {
		console.log( 'checking at ', Date.now() );
		if ( ! this.isMounted() ) {
			return;
		}
		const newValue = ReactDom.findDOMNode( this.refs.searchInput ).value;
		console.log( 'new value', newValue );
		this.props.onQueryChange( newValue );
	},

	render() {
		const emptyContent = this.props.query
			? <EmptyContent query={ this.props.query } />
			: <div>{ this.translate( 'What would you like to find?' ) }</div>;

		if ( this.props.setPageTitle ) {
			this.props.setPageTitle( this.state.title || this.translate( 'Search' ) );
		}

		const store = this.props.store || emptyStore;

		return (
			<Stream { ...this.props } store={ store }
				listName={ this.state.title }
				emptyContent={ emptyContent }
				showFollowInHeader={ true } >
				{ this.props.showBack && <HeaderBack /> }
				<h2>{ this.translate( 'Search' ) }</h2>
				<p>
					<FormTextInput type="text" value={ undefined } defaultValue={ this.props.query } ref="searchInput" onChange={ this.debouncedUpdate } placeholder={ this.translate( 'Enter a search term' ) } />
				</p>
			</Stream>
		);
	}
} );

export default FeedStream;
