import { StepId } from 'calypso/data/paid-newsletter/use-paid-newsletter-query';
import { useSubscriberImportMutation } from 'calypso/data/paid-newsletter/use-subscriber-import-mutation';
import ImporterActionButton from '../../importer-action-buttons/action-button';

type Props = {
	step: StepId;
	engine: string;
	siteId: number;
	navigate?: () => void;
	disabled?: boolean;
	primary?: boolean;
	label?: string;
};

export default function StartImportButton( {
	siteId,
	step,
	engine,
	navigate = () => {},
	disabled,
	primary = true,
	label,
}: Props ) {
	const { enqueueSubscriberImport } = useSubscriberImportMutation();

	const importSubscribers = () => {
		enqueueSubscriberImport( siteId, engine, step );
		navigate();
	};

	return (
		<ImporterActionButton primary={ primary } disabled={ disabled } onClick={ importSubscribers }>
			{ label || 'Import subscribers' }
		</ImporterActionButton>
	);
}
