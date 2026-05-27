import { type Site } from '@automattic/api-core';
import { __, sprintf } from '@wordpress/i18n';
import EmptyState from '../../../components/empty-state';
import StartCapturingButton from './start-capturing-button';
import { getLowercaseTimeframeLabel, type Timeframe } from './timeframe';

export default function BackendEmptyState( {
	site,
	timeframe,
}: {
	site: Site;
	timeframe: Timeframe;
} ) {
	const title = sprintf(
		/* translators: %s is a timeframe like "last hour" or "last 15 minutes". */
		__( 'No APM data in the %s' ),
		getLowercaseTimeframeLabel( timeframe )
	);

	return (
		<EmptyState.Wrapper>
			<EmptyState>
				<EmptyState.Header>
					<EmptyState.Title>{ title }</EmptyState.Title>
					<EmptyState.Description>
						{ __(
							'Capturing is off. Turn it on to collect performance data for your site. New requests will appear here within about 30 seconds.'
						) }
					</EmptyState.Description>
				</EmptyState.Header>
				<StartCapturingButton site={ site } context="empty_state" />
			</EmptyState>
		</EmptyState.Wrapper>
	);
}
