/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import TermSelectorTerms from './terms';

export default React.createClass( {
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
			page: 1,
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

	incrementPage() {
		this.setState( {
			page: this.state.page + 1
		} );
	},

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.taxonomy !== this.props.taxonomy ) {
			this.setState( { page: 1 } );
		}
	},

	render() {
		const { className, taxonomy, onChange, selected, createLink } = this.props;

		const classes = classNames( className );
		const { page, search } = this.state;
		const query = { page, search };

		return (
			<div className={ classes } ref="wrapper">
				<TermSelectorTerms
					taxonomy={ taxonomy }
					onSearch={ this.onSearch }
					onChange={ onChange }
					onNextPage={ this.incrementPage }
					query={ query }
					selected={ selected }
					createLink={ createLink }
				/>
			</div>
		);
	}
} );
