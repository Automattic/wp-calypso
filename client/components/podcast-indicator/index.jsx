/** @format */

/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Tooltip from 'components/tooltip';

class PodcastIndicator extends React.Component {
	static propTypes = {
		size: PropTypes.number,
		hasTooltip: PropTypes.bool,
	};

	static defaultProps = {
		size: 18,
		hasTooltip: true,
	};

	constructor( props ) {
		super( props );
		this.state = {
			tooltipVisible: false,
		};
	}

	showTooltip = () => {
		this.setState( { tooltipVisible: true } );
	};

	hideTooltip = () => {
		this.setState( { tooltipVisible: false } );
	};

	setTooltipContext = tooltipContext => {
		if ( tooltipContext ) {
			this.setState( { tooltipContext } );
		}
	};

	render() {
		const { size, hasTooltip, translate } = this.props;

		const classes = classNames( 'podcast-indicator', this.props.className, {
			'is-compact': this.props.isCompact,
		} );

		return (
			<span className={ classes }>
				<Gridicon
					icon="microphone"
					size={ size }
					ref={ this.setTooltipContext }
					onMouseEnter={ this.showTooltip }
					onMouseLeave={ this.hideTooltip }
				/>
				{ hasTooltip && (
					<Tooltip
						className="podcast-indicator__tooltip"
						context={ this.state.tooltipContext }
						isVisible={ this.state.tooltipVisible }
						position="bottom left"
					>
						{ translate( 'Included in your Podcast feed' ) }
					</Tooltip>
				) }
			</span>
		);
	}
}

export default localize( PodcastIndicator );
