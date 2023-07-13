type AddSitesFormProps = {
	recordTracksEvent: ( eventName: string, eventProperties?: Record< string, unknown > ) => void;
	onClose: () => void;
	onAddFinished: () => void;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AddSitesForm = ( { recordTracksEvent, onClose, onAddFinished }: AddSitesFormProps ) => {
	return <div>Skeleton</div>;
};

export default AddSitesForm;
