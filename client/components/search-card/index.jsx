/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Search from 'components/search';

class SearchCard extends React.Component {
	static propTypes = {
		additionalClasses: PropTypes.string,
		initialValue: PropTypes.string,
		placeholder: PropTypes.string,
		delaySearch: PropTypes.bool,
		onSearch: PropTypes.func.isRequired,
		onSearchChange: PropTypes.func,
		analyticsGroup: PropTypes.string,
		autoFocus: PropTypes.bool,
		disabled: PropTypes.bool,
		dir: PropTypes.string,
		maxLength: PropTypes.number,
		hideOpenIcon: PropTypes.bool,
		disableAutocorrect: PropTypes.bool,
	};

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
	};

	clear = () => {
		this.refs.search.clear();
	};
}

export default SearchCard;
