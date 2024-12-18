import { Card, ShortenedNumber, Spinner } from '@automattic/components';
import { Tooltip } from '@wordpress/components';

/* This is a very stripped down version of HighlightCard
 * HighlightCard doesn't support non-numeric values
 * */

const TopCardValue = ( { value, isLoading } ) => {
	const isNumber = Number.isFinite( value );

	if ( isLoading ) {
		return <Spinner />;
	}
	if ( value === null ) {
		return <span className="highlight-card-count-value">-</span>;
	}

	if ( ! isNumber ) {
		return (
			<span className="highlight-card-count-value" title={ String( value ) }>
				{ value }
			</span>
		);
	}

	return (
		<span className="highlight-card-count-value" title={ String( value ) }>
			<ShortenedNumber value={ value } />
		</span>
	);
};

const TopCard = ( { heading, icon, value, isLoading, tooltip } ) => {
	return (
		<Card className="highlight-card">
			<div className="highlight-card-icon">{ icon }</div>
			<div className="highlight-card-heading">{ heading }</div>
			<div className="highlight-card-count">
				{ tooltip ? (
					<Tooltip text={ tooltip }>
						<TopCardValue value={ value } isLoading={ isLoading } />
					</Tooltip>
				) : (
					<TopCardValue value={ value } isLoading={ isLoading } />
				) }
			</div>
		</Card>
	);
};

export default TopCard;
