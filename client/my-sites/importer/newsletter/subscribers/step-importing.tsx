import { Card } from '@automattic/components';
import { ProgressBar } from '@wordpress/components';
import { Icon, atSymbol } from '@wordpress/icons';
import ImporterActionButton from '../../importer-action-buttons/action-button';
import { SubscribersStepProps } from '../types';

export default function StepImporting( { nextStepUrl }: SubscribersStepProps ) {
	return (
		<Card>
			<div className="summary__content">
				<p>
					<Icon icon={ atSymbol } /> <strong>We're importing your subscribers</strong>
				</p>
			</div>
			<p>
				This may take a few minutes. Feel free to leave this window – we'll let you know when it's
				done.
			</p>
			<p>
				<ProgressBar className="is-larger-progress-bar" />
			</p>
			<ImporterActionButton href={ nextStepUrl }>View Summary</ImporterActionButton>
		</Card>
	);
}
