/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import Gridicon from 'calypso/components/gridicon';

export default class extends React.Component {
	static displayName = 'CurrentThemeButton';

	static propTypes = {
		name: PropTypes.string.isRequired,
		label: PropTypes.string.isRequired,
		icon: PropTypes.string.isRequired,
		href: PropTypes.string,
		onClick: PropTypes.func,
		isPrimary: PropTypes.bool,
	};

	render() {
		return (
			<a
				role="button"
				className={ classNames(
					'current-theme__button',
					'components-button',
					'current-theme__' + this.props.name,
					{
						disabled: ! this.props.href,
						'is-primary': this.props.isPrimary,
						'is-secondary': ! this.props.isPrimary,
					}
				) }
				onClick={ this.props.onClick.bind( null, this.props.name ) }
				href={ this.props.href }
			>
				<Gridicon icon={ this.props.icon } size={ 18 } />
				<span className="current-theme__button-label">{ this.props.label }</span>
			</a>
		);
	}
}
