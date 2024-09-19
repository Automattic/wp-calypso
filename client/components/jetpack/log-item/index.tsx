import { FoldableCard } from '@automattic/components';
import clsx from 'clsx';
import { PureComponent, ReactNode } from 'react';
import CardHeading from 'calypso/components/card-heading';
import type { TranslateResult } from 'i18n-calypso';
import './style.scss';

export interface Props {
	children?: ReactNode;
	className?: string;
	header: string | TranslateResult;
	subheader?: string | ReactNode;
	highlight?: 'info' | 'success' | 'warning' | 'error';
	tag?: string;
	summary?: string | ReactNode;
	expandedSummary?: string | ReactNode;
	clickableHeader?: boolean;
	onClick?: () => void;
	onOpen?: () => void;
}

class LogItem extends PureComponent< Props > {
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
			onOpen,
		} = this.props;
		return (
			<FoldableCard
				header={ this.renderHeader() }
				className={ clsx( 'log-item', className ) }
				highlight={ highlight }
				expandedSummary={ expandedSummary }
				summary={ summary }
				clickableHeader={ clickableHeader }
				onClick={ onClick }
				onOpen={ onOpen }
			>
				{ children }
			</FoldableCard>
		);
	}
}

export default LogItem;
