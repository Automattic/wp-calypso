import { Gridicon } from '@automattic/components';
import clsx from 'clsx';
import type { TranslateResult } from 'i18n-calypso';
import type { FunctionComponent } from 'react';

enum RewindFlowNoticeLevel {
	NOTICE,
	WARNING,
	REMINDER,
}

interface Props {
	gridicon: string;
	link?: string;
	message?: TranslateResult;
	title: TranslateResult;
	type: RewindFlowNoticeLevel;
}

const RewindFlowNotice: FunctionComponent< Props > = ( {
	gridicon,
	link,
	message,
	title,
	type,
} ) => {
	const getTitleClassName = () => {
		switch ( type ) {
			case RewindFlowNoticeLevel.NOTICE:
				return 'rewind-flow-notice__title-notice';
			case RewindFlowNoticeLevel.WARNING:
				return 'rewind-flow-notice__title-warning';
			default:
			case RewindFlowNoticeLevel.REMINDER:
				return 'rewind-flow-notice__title-reminder';
		}
	};

	// The level also goes on the wrapper so the whole notice, not just its
	// heading, can carry a tinted background.
	const levelClassName = {
		[ RewindFlowNoticeLevel.NOTICE ]: 'is-notice',
		[ RewindFlowNoticeLevel.WARNING ]: 'is-warning',
		[ RewindFlowNoticeLevel.REMINDER ]: 'is-reminder',
	}[ type ];

	const renderLink = () => (
		<a className={ getTitleClassName() } href={ link } target="_blank" rel="noopener noreferrer">
			<Gridicon icon={ gridicon } />
			{ title }
		</a>
	);

	const renderNonLink = () => (
		<div className={ getTitleClassName() }>
			<Gridicon icon={ gridicon } />
			<h4>{ title }</h4>
		</div>
	);

	return (
		<div className={ clsx( 'rewind-flow-notice', levelClassName ) }>
			{ link ? renderLink() : renderNonLink() }
			{ message && <p>{ message }</p> }
		</div>
	);
};

export { RewindFlowNotice as default, RewindFlowNoticeLevel };
