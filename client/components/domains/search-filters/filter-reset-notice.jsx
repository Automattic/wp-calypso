import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';

export class FilterResetNotice extends Component {
	static propTypes = {
		isLoading: PropTypes.bool.isRequired,
		lastFilters: PropTypes.shape( {
			exactSldMatchesOnly: PropTypes.bool,
			tlds: PropTypes.arrayOf( PropTypes.string ),
		} ).isRequired,
		suggestions: PropTypes.arrayOf( PropTypes.object ),
	};

	hasActiveFilters() {
		const { lastFilters: { exactSldMatchesOnly, tlds = [] } = {} } = this.props;
		return exactSldMatchesOnly || tlds.length > 0;
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
