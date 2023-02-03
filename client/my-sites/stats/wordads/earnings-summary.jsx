import { Card, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import { useState } from 'react';
import { getEarningsSummaries, getPayoutNotices } from './utils';

const PayoutsNotice = ( { earnings } ) => {
	const notices = getPayoutNotices( earnings );
	const combinedNotice = notices.map( ( item ) => item.value ).join( ' ' );

	return (
		<div className="ads__module-content-text module-content-text module-content-text-info">
			<p>{ combinedNotice }</p>
		</div>
	);
};

const EarningsBreakdown = ( { earnings } ) => {
	const summaries = getEarningsSummaries( earnings );

	return (
		<ul className="ads__earnings-breakdown-list">
			{ summaries.map( ( summary ) => (
				<li key={ summary.id } className="ads__earnings-breakdown-item">
					<span className="ads__earnings-breakdown-label">{ summary.heading }</span>
					<span className="ads__earnings-breakdown-value">{ summary.formattedAmount }</span>
				</li>
			) ) }
		</ul>
	);
};

const EarningsSummary = ( { earnings } ) => {
	const [ showEarningsNotice, setShowEarningsNotice ] = useState( false );
	const infoIcon = showEarningsNotice ? 'info' : 'info-outline';
	const classes = classNames( 'earnings_breakdown', {
		'is-showing-info': showEarningsNotice,
	} );

	const handleEarningsNoticeToggle = ( event ) => {
		event.preventDefault();
		setShowEarningsNotice( ! showEarningsNotice );
	};

	return (
		<Card className={ classes }>
			<div className="ads__module-header module-header">
				<h1 className="ads__module-header-title module-header-title">{ translate( 'Totals' ) }</h1>
				<ul className="ads__module-header-actions module-header-actions">
					<li className="ads__module-header-action module-header-action toggle-info">
						<button
							className="ads__module-header-action-link module-header-action-link"
							aria-label={ translate( 'Show or hide panel information' ) }
							title={ translate( 'Show or hide panel information' ) }
							onClick={ handleEarningsNoticeToggle }
						>
							<Gridicon icon={ infoIcon } />
						</button>
					</li>
				</ul>
			</div>
			<div className="ads__module-content module-content">
				<PayoutsNotice earnings={ earnings } />
				<EarningsBreakdown earnings={ earnings } />
			</div>
		</Card>
	);
};

export default EarningsSummary;
