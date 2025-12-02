import { Card } from '@automattic/components';
import { ProgressBar } from '@wordpress/components';
import { Icon, atSymbol } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { SubscribersStepProps } from '../types';

interface StepImportingProps extends SubscribersStepProps {
	actionButton?: React.ReactNode;
}

export default function StepImporting( { actionButton }: StepImportingProps ) {
	const { __ } = useI18n();
	return (
		<Card>
			<div className="summary__content">
				<p>
					<Icon icon={ atSymbol } /> <strong>{ __( "We're importing your subscribers" ) }</strong>
				</p>
			</div>
			<p>
				{ __(
					"This may take a few minutes. Feel free to leave this window – we'll let you know when it's done."
				) }
			</p>
			<p>
				<ProgressBar className="is-larger-progress-bar" />
			</p>
			{ actionButton }
		</Card>
	);
}
