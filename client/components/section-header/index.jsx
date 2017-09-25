/**
 * External dependencies
 */
import classNames from 'classnames';
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Count from 'components/count';

export default class SectionHeader extends PureComponent {
	static defaultProps = {
		label: '',
		href: null,
	};

	render() {
		const hasCount = 'number' === typeof this.props.count;
		const isEmpty = ! ( this.props.label || hasCount || this.props.children );
		const classes = classNames( this.props.className, 'section-header', { 'is-empty': isEmpty } );

		return (
			<CompactCard className={ classes } href={ this.props.href }>
				<div className="section-header__label">
					<span className="section-header__label-text">
						{ this.props.label }
					</span>
					{ hasCount && <Count count={ this.props.count } /> }
				</div>
				<div className="section-header__actions">
					{ this.props.children }
				</div>
			</CompactCard>
		);
	}
}
