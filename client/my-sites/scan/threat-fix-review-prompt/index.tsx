/**
 * External dependencies
 */
import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';

/**
 * Internal dependencies
 */
import { Button } from '@wordpress/components';
import Gridicon from 'calypso/components/gridicon';
import getThreatFixedReviewPrompt from 'calypso/state/ui/selectors/get-threat-fixed-review-prompt';
import { hideThreatFixedReviewPrompt } from 'calypso/state/ui/threat-fixed-review-prompt/actions.js';

/**
 * Style dependencies
 */
import './style.scss';

const ThreatFixReviewPrompt: React.FC = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const moment = useLocalizedMoment();

	const { isVisible, fixDate } = useSelector( ( state ) => getThreatFixedReviewPrompt( state ) );

	const dismiss = useCallback( () => {
		dispatch( hideThreatFixedReviewPrompt() );
	}, [ dispatch ] );

	return isVisible ? (
		<div className="threat-fix-review-prompt">
			<div className="threat-fix-review-prompt__header">
				<p>
					{ translate( 'Jetpack auto-fixed all threats {{strong}}%s{{/strong}}.', {
						args: [ moment.utc( fixDate ).fromNow() ],
						components: {
							strong: <strong />,
						},
					} ) }
				</p>
				<p>{ translate( 'Did you have an easy threat-fix experience?' ) }</p>
			</div>
			<div className="threat-fix-review-prompt__buttons">
				<Button
					href="https://wordpress.org/support/plugin/jetpack/reviews/#new-post"
					target="_blank"
					onClick={ dismiss }
					isSecondary
				>
					{ translate( 'Leave Jetpack a review' ) }
					<Gridicon icon="external" />
				</Button>
				<Button onClick={ dismiss } isSecondary>
					{ translate( 'No thanks' ) }
					<Gridicon icon="cross" />
				</Button>
			</div>
		</div>
	) : null;
};

export default ThreatFixReviewPrompt;
