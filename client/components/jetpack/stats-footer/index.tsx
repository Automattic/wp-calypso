/**
 * External dependencies
 */
import React, { ReactElement } from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'calypso/components/gridicon';

import './style.scss';

type Stat = {
	name: string;
	number: number;
};

interface FooterProps {
	header?: string;
	noticeText?: string;
	noticeLink?: string;
	stats?: Stat[];
}

interface NoticeProps {
	text: string;
	link?: string;
}

const Notice = ( props: NoticeProps ): ReactElement => (
	<div className="stats-footer__notice">
		<Gridicon icon="info" className="stats-footer__notice-icon" />
		{ props.text }
		{ props.link && (
			<>
				&nbsp;<a href={ props.link }>Learn more &raquo;</a>
			</>
		) }
	</div>
);

const Stat = ( props: Stat ): ReactElement => (
	<div className="stats-footer__stat">
		<span className="stats-footer__stat-number">{ props.number }</span>
		&nbsp;
		<span className="stats-footer__stat-name">{ props.name }</span>
	</div>
);

const StatsFooter = ( props: FooterProps ): ReactElement => (
	<div className="stats-footer">
		{ props.header && <h3 className="stats-footer__header">{ props.header }</h3> }
		{ props.stats && props.stats.map( ( stat, index ) => <Stat key={ index } { ...stat } /> ) }
		{ props.noticeText && <Notice text={ props.noticeText } link={ props.noticeLink } /> }
	</div>
);

export default StatsFooter;
