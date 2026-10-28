import { useI18n } from '@wordpress/react-i18n';
import PageViewTracker from 'calypso/a8c-for-agencies/components/a4a-page-view-tracker';
import DocumentHead from 'calypso/components/data/document-head';
import EmptyContent from 'calypso/components/empty-content';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getErrorPreset } from '../presets';

import './style.scss';

export default function ErrorPage( { querystring }: { querystring: string } ) {
	const { __ } = useI18n();
	const dispatch = useDispatch();
	const preset = getErrorPreset( querystring, __ );

	return (
		<div className="layout has-no-sidebar has-no-masterbar">
			<DocumentHead title={ preset.title } />
			<PageViewTracker title="Error" path="/error" />
			<main className="layout__content" id="content">
				<div className="layout__primary" id="primary">
					<EmptyContent
						className="a4a-error-page"
						title={ preset.title }
						line={ preset.subtitle }
						action={ preset.buttonText }
						actionURL={ preset.buttonUrl }
						actionCallback={ () =>
							dispatch(
								recordTracksEvent( 'calypso_a4a_error_return', {
									destination: preset.buttonUrl === '/' ? 'home' : 'pressable',
								} )
							)
						}
					/>
				</div>
			</main>
		</div>
	);
}
