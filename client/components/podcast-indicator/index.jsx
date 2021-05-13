/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */
import Tooltip from 'calypso/components/tooltip';

/**
 * Style dependencies
 */
import './style.scss';

class PodcastIndicator extends React.Component {
	static propTypes = {
		size: PropTypes.number,
		tooltipType: PropTypes.oneOf( [ 'category', 'episode', null ] ),
	};

	static defaultProps = {
		size: 18,
		tooltipType: 'category',
	};

	state = {
		tooltipVisible: false,
	};

	tooltipContext = React.createRef();

	showTooltip = () => {
		this.setState( { tooltipVisible: true } );
	};

	hideTooltip = () => {
		this.setState( { tooltipVisible: false } );
	};

	render() {
		const { size, tooltipType, translate } = this.props;

		let tooltipMessage = null;
		switch ( tooltipType ) {
			case 'category':
				tooltipMessage = translate( 'Posts in this category are included in your Podcast feed' );
				break;
			case 'episode':
				tooltipMessage = translate( 'Included in your Podcast feed' );
				break;
		}

		const classes = classNames( 'podcast-indicator', this.props.className, {
			'is-compact': this.props.isCompact,
		} );

		return (
			<span className={ classes }>
				<Gridicon
					icon="microphone"
					size={ size }
					ref={ this.tooltipContext }
					onMouseEnter={ this.showTooltip }
					onMouseLeave={ this.hideTooltip }
				/>
				{ tooltipMessage && (
					<Tooltip
						className="podcast-indicator__tooltip"
						context={ this.tooltipContext.current }
						isVisible={ this.state.tooltipVisible }
						position="bottom left"
					>
						{ tooltipMessage }
					</Tooltip>
				) }
			</span>
		);
	}
}

export default localize( PodcastIndicator );
