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
				page: 1,
				search: searchTerm
			} );
		}
	},

	render() {
		const { className, taxonomy, onChange, selected, createLink } = this.props;

		const classes = classNames( className );
		const { search } = this.state;
		const query = { search };

		return (
			<div className={ classes } ref="wrapper">
				<TermTreeSelectorTerms
					taxonomy={ taxonomy }
					onSearch={ this.onSearch }
					onChange={ onChange }
					query={ query }
					selected={ selected }
					createLink={ createLink }
				/>
			</div>
		);
	}
} );
