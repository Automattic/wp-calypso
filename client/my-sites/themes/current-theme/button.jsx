/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */

import { isOutsideCalypso } from 'lib/url';
import Gridicon from 'components/gridicon';

export default React.createClass( {
	displayName: 'CurrentThemeButton',

	propTypes: {
		name: PropTypes.string.isRequired,
		label: PropTypes.string.isRequired,
		icon: PropTypes.string.isRequired,
		href: PropTypes.string,
		onClick: PropTypes.func
	},

	render() {
		return (
			<a role="button"
				className={ classNames(
					'current-theme__button',
					'current-theme__' + this.props.name,
					{ disabled: ! this.props.href }
				) }
				onClick={ this.props.onClick.bind( null, this.props.name ) }
				href={ this.props.href }
				target={ isOutsideCalypso( this.props.href ) ? '_blank' : null } >
				<Gridicon icon={ this.props.icon } size={ 18 } />
				<span className="current-theme__button-label">
					{ this.props.label }
				</span>
			</a>
		);
	}
} );
