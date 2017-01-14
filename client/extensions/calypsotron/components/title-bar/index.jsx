/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */

import SectionNav from 'components/section-nav';

export default class TitleBar extends React.Component {
	static propTypes = {
		icon: PropTypes.string.isRequired,
		title: PropTypes.string.isRequired,
	}

	render() {
		const { icon, title } = this.props;
		const iconSize = 24;

		return (
			<SectionNav className="title-bar">
				<div className="title-bar__title">
					<Gridicon icon={ icon } size={ iconSize } className="title-bar__title-icon" />
					<h1 className="title-bar__title-name">
						{ title }
					</h1>
				</div>
				<div className="title-bar__sidebar">
					{ this.props.children }
				</div>
			</SectionNav>
		);
	}
}
