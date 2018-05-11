/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import Card from 'components/card';

export class FilterResetNotice extends Component {
	static propTypes = {
		isLoading: PropTypes.bool.isRequired,
		lastFilters: PropTypes.shape( {
			includeDashes: PropTypes.bool,
			maxCharacters: PropTypes.string,
			showExactMatchesOnly: PropTypes.bool,
			tlds: PropTypes.arrayOf( PropTypes.string ),
		} ).isRequired,
		suggestions: PropTypes.arrayOf( PropTypes.object ),
	};

	hasActiveFilters() {
		return (
			( this.props.lastFilters.includeDashes && 1 ) ||
			( this.props.lastFilters.showExactMatchesOnly && 1 ) ||
			( this.props.lastFilters.maxCharacters !== '' && 1 ) ||
			this.props.lastFilters.tlds.length > 0
		);
	}

	hasTooFewSuggestions() {
		const { suggestions } = this.props;
		return Array.isArray( suggestions ) && suggestions.length < 10;
	}

	onReset = () => {
		this.props.onReset();
	};

	render() {
		return (
			config.isEnabled( 'domains/kracken-ui/pagination' ) &&
			this.hasActiveFilters() &&
			this.hasTooFewSuggestions() && (
				<Card
					className={ this.props.className }
					disabled={ this.props.isLoading }
					onClick={ this.onReset }
					tagName="button"
				>
					{ this.props.translate( 'Click here to disable filters for more results' ) }
				</Card>
			)
		);
	}
}

export default localize( FilterResetNotice );
