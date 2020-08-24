/**
 * External dependencies
 */

import React from 'react';
import Gridicon from 'components/gridicon';
import { decodeEntities } from 'lib/formatting';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import { localizeUrl } from 'lib/i18n-utils';

export default class extends React.PureComponent {
	static displayName = 'HelpResult';

	onClick = ( event ) => {
		if ( this.props.helpLink.disabled ) {
			return event.preventDefault();
		}

		this.props.onClick && this.props.onClick( event, this.props.helpLink );
	};

	getResultIcon = () => {
		const { iconTypeDescription = 'book' } = this.props;
		const iconClass = 'help-result__icon';
		const iconSize = 24;
		// By rule, gridicons don't contain logos so we need a special case here
		if ( iconTypeDescription === 'jetpack' ) {
			return (
				<svg
					className={ iconClass }
					height={ iconSize }
					width={ iconSize }
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
				>
					<path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-.39 12.335l-3.14-.8c-.798-.202-1.18-1.11-.77-1.822l3.91-6.773v9.395zm4.84-2.048l-3.91 6.773V9.665l3.14.8c.798.202 1.18 1.11.77 1.822z" />
				</svg>
			);
		}
		return <Gridicon className={ iconClass } icon={ iconTypeDescription } size={ iconSize } />;
	};

	render() {
		return (
			<a
				className="help-result"
				href={ localizeUrl( this.props.helpLink.link ) }
				target="__blank"
				onClick={ this.onClick }
			>
				<CompactCard className="help-result__wrapper">
					{ this.getResultIcon() }
					<h2 className="help-result__title">{ decodeEntities( this.props.helpLink.title ) }</h2>
					<p className="help-result__description">
						{ decodeEntities( this.props.helpLink.description ) }
					</p>
				</CompactCard>
			</a>
		);
	}
}
