/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { bumpStat } from '../rest-client/bump-stat';

// from $wpnc__title-bar-height in boot/sizes.scss
const TITLE_OFFSET = 38;

export class EmptyMessage extends Component {
	UNSAFE_componentWillMount() {
		if ( this.props.showing ) {
			bumpStat( 'notes-empty-message', this.props.name + '_shown' );
		}
	}

	componentDidUpdate() {
		if ( this.props.showing ) {
			bumpStat( 'notes-empty-message', this.props.name + '_shown' );
		}
	}

	handleClick = () => bumpStat( 'notes-empty-message', this.props.name + '_clicked' );

	render() {
		const { emptyMessage, link, linkMessage } = this.props;

		return (
			<div
				className="wpnc__empty-notes-container"
				style={ { height: this.props.height - TITLE_OFFSET + 'px' } }
			>
				{ link && linkMessage && (
					<div className="wpnc__empty-notes">
						<h2>{ emptyMessage }</h2>
						<p>
							<a
								href={ link }
								target="_blank"
								rel="noopener noreferrer"
								onClick={ this.handleClick }
							>
								{ linkMessage }
							</a>
						</p>
					</div>
				) }
				{ ! link && linkMessage && (
					<div className="wpnc__empty-notes">
						<h2>{ emptyMessage }</h2>
						<p>{ linkMessage }</p>
					</div>
				) }
				{ ! link && ! linkMessage && (
					<div className="wpnc__empty-notes">
						<h2>{ emptyMessage }</h2>
					</div>
				) }
			</div>
		);
	}
}

export default EmptyMessage;
