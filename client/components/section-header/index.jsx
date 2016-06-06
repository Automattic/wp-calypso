/** @ssr-ready **/

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

	displayName: 'SectionHeader',

	getDefaultProps() {
		return {
			label: '',
			href: null
		};
	},

	render() {
		const classes = classNames(
			this.props.className,
			'section-header'
		);

		return (
			<CompactCard className={ classes } href={ this.props.href }>
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
