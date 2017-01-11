/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import TermTreeSelectorTerms from './terms';

export default React.createClass( {
	displayName: 'TermTreeSelector',

	propTypes: {
		multiple: PropTypes.bool,
		className: PropTypes.string,
		onChange: PropTypes.func.isRequired,
		selected: PropTypes.array,
		createLink: PropTypes.string,
		analyticsPrefix: PropTypes.string,
		taxonomy: PropTypes.string
	},

	getDefaultProps() {
		return {
			analyticsPrefix: 'Category Selector',
			selected: [],
			taxonomy: 'category',
			onChange: () => {}
		};
	},

	getInitialState() {
		return {
			search: ''
		};
	},

	onSearch( searchTerm ) {
		if ( searchTerm !== this.state.search ) {
			this.setState( {
				search: searchTerm
			} );
		}
	},

	render() {
		const { className, taxonomy, onChange, selected, createLink, multiple } = this.props;

		const classes = classNames( className );
		const { search } = this.state;
		const query = {};
		if ( search && search.length ) {
			query.search = search;
		}

		return (
			<div className={ classes } ref="wrapper">
				<TermTreeSelectorTerms
					taxonomy={ taxonomy }
					onSearch={ this.onSearch }
					onChange={ onChange }
					query={ query }
					selected={ selected }
					createLink={ createLink }
					multiple={ multiple }
				/>
			</div>
		);
	}
} );
