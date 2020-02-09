/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import VerticalNavItem from 'components/vertical-nav/item';
import MaterialIcon from 'components/material-icon';

import './style.scss';

class VerticalNavItemMulti extends React.Component {
	static propTypes = {
		path: PropTypes.string,
		onClick: PropTypes.func,
		materialIcon: PropTypes.string,
		text: PropTypes.string,
		description: PropTypes.string,
		external: PropTypes.bool,
	};

	render() {
		const { path, onClick, materialIcon, text, description, external } = this.props;

		return (
			<VerticalNavItem
				path={ path }
				onClick={ onClick }
				external={ external }
				className="item-multi__nav-item"
			>
				<MaterialIcon icon={ materialIcon } className="item-multi__icon" />
				<div>
					<div>{ text }</div>
					<small>{ description }</small>
				</div>
			</VerticalNavItem>
		);
	}
}

export default VerticalNavItemMulti;
