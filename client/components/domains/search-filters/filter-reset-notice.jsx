/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';
import { Card } from '@automattic/components';

export class FilterResetNotice extends Component {
	static propTypes = {
		isLoading: PropTypes.bool.isRequired,
		lastFilters: PropTypes.shape( {
			includeDashes: PropTypes.bool,
			maxCharacters: PropTypes.string,
			exactSldMatchesOnly: PropTypes.bool,
			tlds: PropTypes.arrayOf( PropTypes.string ),
		} ).isRequired,
		suggestions: PropTypes.arrayOf( PropTypes.object ),
	};

	hasActiveFilters() {
		const {
			lastFilters: { includeDashes, exactSldMatchesOnly, maxCharacters, tlds = [] } = {},
		} = this.props;
		return includeDashes || exactSldMatchesOnly || maxCharacters !== '' || tlds.length > 0;
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
