import { useSubscriberImportMutation } from 'calypso/data/paid-newsletter/use-subscriber-import-mutation';
import ImporterActionButton from '../../importer-action-buttons/action-button';

type Props = {
	step: string;
	engine: string;
	siteId: number;
	navigate?: () => void;
	disabled?: boolean;
};

export default function StartImportButton( {
	siteId,
	step,
	engine,
	navigate = () => {},
	disabled,
}: Props ) {
	const { enqueueSubscriberImport } = useSubscriberImportMutation();

	const importSubscribers = () => {
		enqueueSubscriberImport( siteId, engine, step );
		navigate();
	};

	return (
		<ImporterActionButton primary disabled={ disabled } onClick={ importSubscribers }>
			Continue
		</ImporterActionButton>
	);
}
