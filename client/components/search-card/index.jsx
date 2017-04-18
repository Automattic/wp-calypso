/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Search from 'components/search';

class SearchCard extends React.Component {

	static propTypes = {
		additionalClasses: React.PropTypes.string,
		initialValue: React.PropTypes.string,
		placeholder: React.PropTypes.string,
		delaySearch: React.PropTypes.bool,
		onSearch: React.PropTypes.func.isRequired,
		onSearchChange: React.PropTypes.func,
		analyticsGroup: React.PropTypes.string,
		autoFocus: React.PropTypes.bool,
		disabled: React.PropTypes.bool,
		dir: React.PropTypes.string,
		maxLength: React.PropTypes.number,
		hideOpenIcon: React.PropTypes.bool,
	}

	render() {
		const cardClasses = classnames( 'search-card', this.props.className );

		return (
			<Card className={ cardClasses }>
				<Search ref="search" { ...this.props } />
			</Card>
		);
	}

	focus = () => {
		this.refs.search.focus();
	}

	clear = () => {
		this.refs.search.clear();
	}
}

export default SearchCard;
