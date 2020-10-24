/**
 * External dependencies
 */
import React, { ReactNode } from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import CardHeading from 'calypso/components/card-heading';
import FoldableCard from 'calypso/components/foldable-card';

import './style.scss';

export interface Props {
	children?: ReactNode;
	className?: string;
	header: string | i18nCalypso.TranslateResult;
	subheader?: string | ReactNode;
	highlight?: 'info' | 'success' | 'warning' | 'error';
	tag?: string;
	summary?: string | ReactNode;
	expandedSummary?: string | ReactNode;
	clickableHeader?: boolean;
	onClick?: Function;
}

class LogItem extends React.PureComponent< Props > {
	renderHeader() {
		const { header, subheader, tag } = this.props;

		return (
			<div className="log-item__header-wrapper">
				{ tag && <span className="log-item__tag">{ tag }</span> }
				<CardHeading tagName="h2" size={ 18 }>
					{ header }
				</CardHeading>
				{ subheader && <div className="log-item__subheader">{ subheader }</div> }
			</div>
		);
	}

	render() {
		const {
			clickableHeader,
			highlight,
			children,
			className,
			expandedSummary,
			summary,
			onClick,
		} = this.props;
		return (
			<FoldableCard
				header={ this.renderHeader() }
				className={ classnames( 'log-item', className ) }
				highlight={ highlight }
				expandedSummary={ expandedSummary }
				summary={ summary }
				clickableHeader={ clickableHeader }
				onClick={ onClick }
			>
				{ children }
			</FoldableCard>
		);
	}
}

export default LogItem;
