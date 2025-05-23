import { Card, Spinner } from '@automattic/components';
import { formatNumberCompact } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';

/* This is a very stripped down version of HighlightCard
 * HighlightCard doesn't support non-numeric values
 * */

const TopCardValue = ( { value, isLoading } ) => {
	const isNumber = Number.isFinite( value );

	if ( isLoading ) {
		return <Spinner baseClassName="calypso-spinner" />;
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
			{ formatNumberCompact( value ) }
		</span>
	);
};

const TopCard = ( { heading, icon, value, isLoading, emailIsSending = false } ) => {
	const translate = useTranslate();
	return (
		<Card className="highlight-card">
			<div className="highlight-card-icon">{ icon }</div>
			<div className="highlight-card-heading">{ heading }</div>
			<div className={ `highlight-card-count ${ emailIsSending ? 'is-sending-email' : '' }` }>
				<TopCardValue
					value={ emailIsSending ? translate( 'Still sending emails.' ) : value }
					isLoading={ isLoading }
				/>
			</div>
		</Card>
	);
};

export default TopCard;
