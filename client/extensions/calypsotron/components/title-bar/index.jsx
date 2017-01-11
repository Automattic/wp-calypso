/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */

export default class TitleBar extends React.Component {
	static propTypes = {
		icon: PropTypes.string.isRequired,
		title: PropTypes.string.isRequired,
	}

	render() {
		const { icon, title } = this.props;
		const iconSize = 24;

		return (
			<div className="title-bar">
				<div className="title-bar__title">
					<h1>
						<Gridicon icon={ icon } size={ iconSize } className="title-bar__title-icon" />
						{ title }
					</h1>
				</div>
				<div className="title-bar__sidebar">
					{ this.props.children }
				</div>
			</div>
		);
	}
}
