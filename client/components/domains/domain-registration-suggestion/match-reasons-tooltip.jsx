/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Popover from 'components/popover';

export default class MatchReasonsTooltip extends Component {
	static propTypes = {
		matchReasons: PropTypes.arrayOf( PropTypes.string ),
	};
	state = {
		show: false,
	};

	open = () => {
		this.setState( { show: true } );
	};

	close = () => {
		this.setState( { show: false } );
	};

	bindReference = ref => ( this.container = ref );

	render() {
		return (
			<span className="domain-registration-suggestion__match-reasons-tooltip-container">
				<Gridicon
					icon="info"
					size={ 18 }
					ref={ this.bindReference }
					onMouseEnter={ this.open }
					onMouseLeave={ this.close }
				/>
				<Popover
					rootClassName="domain-registration-suggestion__match-reasons-tooltip"
					isVisible={ this.state.show }
					onClose={ this.close }
					position="right"
					context={ this.container }
				>
					{ this.props.matchReasons.map( ( phrase, index ) => (
						<div className="domain-registration-suggestion__match-reason-tooltipped" key={ index }>
							<Gridicon icon="checkmark" size={ 18 } />
							{ phrase }
						</div>
					) ) }
				</Popover>
			</span>
		);
	}
}
