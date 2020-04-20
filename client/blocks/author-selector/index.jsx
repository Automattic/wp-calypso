/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import debugModule from 'debug';
import { trim } from 'lodash';

/**
 * Internal dependencies
 */
import SiteUsersFetcher from 'components/site-users-fetcher';
import SwitcherShell from './switcher-shell';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:author-selector' );

class AuthorSelector extends React.Component {
	static displayName = 'AuthorSelector';

	static propTypes = {
		siteId: PropTypes.number.isRequired,
		onSelect: PropTypes.func,
		exclude: PropTypes.oneOfType( [ PropTypes.arrayOf( PropTypes.number ), PropTypes.func ] ),
		allowSingleUser: PropTypes.bool,
		popoverPosition: PropTypes.string,
		transformAuthor: PropTypes.func,
	};

	static defaultProps = {
		showAuthorMenu: false,
		onClose: function () {},
		allowSingleUser: false,
		popoverPosition: 'bottom left',
	};

	state = {
		search: '',
	};

	componentDidMount() {
		debug( 'AuthorSelector mounted' );
	}

	render() {
		let searchString = this.state.search || '';
		searchString = trim( searchString );

		const fetchOptions = {
			siteId: this.props.siteId,
			order: 'ASC',
			order_by: 'display_name',
			number: 50,
		};

		if ( searchString ) {
			fetchOptions.number = 20; // make search a little faster
			fetchOptions.search = searchString;
			fetchOptions.search_columns = [ 'user_login', 'display_name' ];
		}

		Object.freeze( fetchOptions );
		return (
			<SiteUsersFetcher fetchOptions={ fetchOptions } exclude={ this.props.exclude }>
				<SwitcherShell { ...this.props } updateSearch={ this._updateSearch } />
			</SiteUsersFetcher>
		);
	}

	_updateSearch = ( searchTerm ) => {
		searchTerm = searchTerm ? '*' + searchTerm + '*' : '';
		this.setState( {
			search: searchTerm,
		} );
	};
}

export default localize( AuthorSelector );
