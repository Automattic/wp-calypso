/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Count from 'components/count';

export default React.createClass( {
	getDefaultProps() {
		return {
			label: '',
		};
	},

	render() {
		const classes = classNames(
			this.props.className,
			'section-header'
		);

		return (
			<CompactCard className={ classes }>
				<div className="section-header__label">
					{ this.props.label }
					{
						'number' === typeof this.props.count &&
						<Count count={ this.props.count } />
					}
				</div>
				<div className="section-header__actions">
					{ this.props.children }
				</div>
			</CompactCard>
		);
	}
} );
