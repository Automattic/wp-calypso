import { useTranslate } from 'i18n-calypso';
import StatsModule from '../stats-module';
import statsStrings from '../stats-strings';

const StatsModuleEmails = ( props ) => {
	// ToDo: Add typing/testing of period & query props.
	// Currently accepts undefined without issue.
	const { period, query, className } = props;
	const translate = useTranslate();
	const moduleStrings = statsStrings();

	return (
		<StatsModule
			additionalColumns={ {
				header: (
					<>
						<span>{ translate( 'Opens' ) }</span>
					</>
				),
				body: ( item ) => (
					<>
						<span>{ item.opens }</span>
					</>
				),
			} }
			path="emails"
			moduleStrings={ moduleStrings.emails }
			period={ period }
			query={ query }
			statType="statsEmailsSummary"
			mainItemLabel={ translate( 'Latest Emails' ) }
			metricLabel={ translate( 'Clicks' ) }
			showSummaryLink
			className={ className }
			hasNoBackground
		/>
	);
};

export default StatsModuleEmails;
